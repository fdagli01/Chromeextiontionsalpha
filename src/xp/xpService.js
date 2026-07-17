import { getProgress, saveProgress } from '../db/progressRepo.js'
import { evaluateBadges } from '../badges/badges.js'
import { emitProgressChanged } from './progressEvents.js'
import { levelForXp, resolveStreakWithInsurance, xpForQuality } from './xp.js'

/** Reviews needed in a single day to complete the daily quest. */
export const DAILY_QUEST_TARGET = 5

/** Bonus XP awarded once, the moment the daily quest target is reached. */
export const DAILY_QUEST_BONUS_XP = 25

/** Most streak-insurance tokens a player can bank at once. */
export const MAX_STREAK_SHIELDS = 3

/**
 * Records a review outcome against a theme's progress: adds XP, recomputes
 * level, updates the daily streak, evaluates newly earned badges, and
 * tracks today's review count toward the daily quest (awarding a one-time
 * bonus the moment the target is reached). Called once per graded review.
 * @param {string} themeId
 * @param {number} quality - 1-4, see srs/fsrs.js QUALITY
 * @param {Object} [opts]
 * @param {number} [opts.multiplier] - momentum/event XP multiplier applied to the
 *   per-review XP (not the one-time daily-quest bonus). Defaults to 1.
 * @param {number} [opts.combo] - consecutive-correct count after this review, for
 *   tracking the day's best combo (a daily-briefing objective). Defaults to 0.
 * @param {Date} [opts.now]
 * @returns {Promise<{
 *   progress: import('../db/progressRepo.js').ThemeProgress,
 *   xpGained: number,
 *   baseXp: number,
 *   leveledUp: boolean,
 *   newBadges: import('../badges/badges.js').BadgeDef[],
 *   dailyQuest: {current: number, target: number, justCompleted: boolean, bonusXp: number},
 * }>}
 */
export async function awardReviewXp(themeId, quality, opts = {}) {
  const { multiplier = 1, combo = 0, now = new Date() } = opts
  const current = await getProgress(themeId)
  const today = now.toISOString().slice(0, 10)

  const isNewQuestDay = current.dailyQuestDate !== today
  const dailyReviewCount = (isNewQuestDay ? 0 : current.dailyReviewCount) + 1
  const alreadyClaimed = isNewQuestDay ? false : current.dailyQuestClaimed
  const questJustCompleted = !alreadyClaimed && dailyReviewCount >= DAILY_QUEST_TARGET
  const bonusXp = questJustCompleted ? DAILY_QUEST_BONUS_XP : 0

  // The momentum multiplier scales the earned-per-review XP but not the
  // flat daily-quest bonus, so a combo can't inflate the fixed quest reward.
  const baseXp = Math.round(xpForQuality(quality) * multiplier)
  const xpGained = baseXp + bonusXp
  const nextXp = current.xp + xpGained
  const nextLevel = levelForXp(nextXp)
  const leveledUp = nextLevel > current.level

  // Streak insurance: a single missed day is forgiven if a shield is banked.
  const { streak: nextStreak, shields: shieldsAfterUse, shieldUsed } = resolveStreakWithInsurance(
    current.lastActiveDate,
    today,
    current.streak,
    current.streakShields
  )

  // Leveling up mints one streak-insurance token (capped), so the shield
  // supply is earned through play rather than bought.
  const nextShields = Math.min(MAX_STREAK_SHIELDS, shieldsAfterUse + (leveledUp ? 1 : 0))

  // Daily-briefing objective tracking, reset when the quest day rolls over.
  const dailyBestCombo = Math.max(isNewQuestDay ? 0 : current.dailyBestCombo, combo)
  const dailyXp = (isNewQuestDay ? 0 : current.dailyXp) + xpGained

  const { badges, newlyEarned } = evaluateBadges({
    streak: nextStreak,
    level: nextLevel,
    xp: nextXp,
    badges: current.badges,
  })

  const progress = await saveProgress(themeId, {
    xp: nextXp,
    level: nextLevel,
    streak: nextStreak,
    streakShields: nextShields,
    lastActiveDate: today,
    badges,
    dailyQuestDate: today,
    dailyReviewCount,
    dailyQuestClaimed: alreadyClaimed || questJustCompleted,
    dailyBestCombo,
    dailyXp,
  })

  emitProgressChanged(themeId, progress)

  return {
    progress,
    xpGained,
    baseXp,
    leveledUp,
    streakShieldUsed: shieldUsed,
    newBadges: newlyEarned,
    dailyQuest: {
      current: Math.min(dailyReviewCount, DAILY_QUEST_TARGET),
      target: DAILY_QUEST_TARGET,
      justCompleted: questJustCompleted,
      bonusXp,
    },
  }
}

/**
 * Awards a flat XP bonus outside the normal per-review flow (e.g. a won
 * Historical Crisis), recomputing level and re-evaluating badges the same
 * way a graded review would.
 * @param {string} themeId
 * @param {number} amount
 * @returns {Promise<{progress: import('../db/progressRepo.js').ThemeProgress, leveledUp: boolean, newBadges: import('../badges/badges.js').BadgeDef[]}>}
 */
export async function awardBonusXp(themeId, amount) {
  const current = await getProgress(themeId)
  const nextXp = current.xp + amount
  const nextLevel = levelForXp(nextXp)

  const { badges, newlyEarned } = evaluateBadges({
    streak: current.streak,
    level: nextLevel,
    xp: nextXp,
    badges: current.badges,
  })

  const progress = await saveProgress(themeId, { xp: nextXp, level: nextLevel, badges })
  emitProgressChanged(themeId, progress)

  return { progress, leveledUp: nextLevel > current.level, newBadges: newlyEarned }
}

/**
 * Awards a completed daily bounty: flat XP plus one streak-insurance shield
 * (capped, same supply used by the level-up mint), in a single save so the
 * two rewards can't race against a concurrent review's progress write.
 * @param {string} themeId
 * @param {number} amount
 * @returns {Promise<{progress: import('../db/progressRepo.js').ThemeProgress, leveledUp: boolean, newBadges: import('../badges/badges.js').BadgeDef[]}>}
 */
export async function awardBounty(themeId, amount) {
  const current = await getProgress(themeId)
  const nextXp = current.xp + amount
  const nextLevel = levelForXp(nextXp)
  const nextShields = Math.min(MAX_STREAK_SHIELDS, current.streakShields + 1)

  const { badges, newlyEarned } = evaluateBadges({
    streak: current.streak,
    level: nextLevel,
    xp: nextXp,
    badges: current.badges,
  })

  const progress = await saveProgress(themeId, {
    xp: nextXp,
    level: nextLevel,
    streakShields: nextShields,
    badges,
  })
  emitProgressChanged(themeId, progress)

  return { progress, leveledUp: nextLevel > current.level, newBadges: newlyEarned }
}
