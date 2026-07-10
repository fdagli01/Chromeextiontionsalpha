import { getProgress, saveProgress } from '../db/progressRepo.js'
import { evaluateBadges } from '../badges/badges.js'
import { emitProgressChanged } from './progressEvents.js'
import { computeStreak, levelForXp, xpForQuality } from './xp.js'

/** Reviews needed in a single day to complete the daily quest. */
export const DAILY_QUEST_TARGET = 5

/** Bonus XP awarded once, the moment the daily quest target is reached. */
export const DAILY_QUEST_BONUS_XP = 25

/**
 * Records a review outcome against a theme's progress: adds XP, recomputes
 * level, updates the daily streak, evaluates newly earned badges, and
 * tracks today's review count toward the daily quest (awarding a one-time
 * bonus the moment the target is reached). Called once per graded review.
 * @param {string} themeId
 * @param {number} quality - 0-5, see sm2.QUALITY
 * @param {Date} [now]
 * @returns {Promise<{
 *   progress: import('../db/progressRepo.js').ThemeProgress,
 *   xpGained: number,
 *   leveledUp: boolean,
 *   newBadges: import('../badges/badges.js').BadgeDef[],
 *   dailyQuest: {current: number, target: number, justCompleted: boolean, bonusXp: number},
 * }>}
 */
export async function awardReviewXp(themeId, quality, now = new Date()) {
  const current = await getProgress(themeId)
  const today = now.toISOString().slice(0, 10)

  const isNewQuestDay = current.dailyQuestDate !== today
  const dailyReviewCount = (isNewQuestDay ? 0 : current.dailyReviewCount) + 1
  const alreadyClaimed = isNewQuestDay ? false : current.dailyQuestClaimed
  const questJustCompleted = !alreadyClaimed && dailyReviewCount >= DAILY_QUEST_TARGET
  const bonusXp = questJustCompleted ? DAILY_QUEST_BONUS_XP : 0

  const xpGained = xpForQuality(quality) + bonusXp
  const nextXp = current.xp + xpGained
  const nextLevel = levelForXp(nextXp)
  const nextStreak = computeStreak(current.lastActiveDate, today, current.streak)

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
    lastActiveDate: today,
    badges,
    dailyQuestDate: today,
    dailyReviewCount,
    dailyQuestClaimed: alreadyClaimed || questJustCompleted,
  })

  emitProgressChanged(themeId, progress)

  return {
    progress,
    xpGained,
    leveledUp: nextLevel > current.level,
    newBadges: newlyEarned,
    dailyQuest: {
      current: Math.min(dailyReviewCount, DAILY_QUEST_TARGET),
      target: DAILY_QUEST_TARGET,
      justCompleted: questJustCompleted,
      bonusXp,
    },
  }
}
