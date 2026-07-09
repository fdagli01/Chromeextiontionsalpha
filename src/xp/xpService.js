import { getProgress, saveProgress } from '../db/progressRepo.js'
import { evaluateBadges } from '../badges/badges.js'
import { computeStreak, levelForXp, xpForQuality } from './xp.js'

/**
 * Records a review outcome against a theme's progress: adds XP, recomputes
 * level, updates the daily streak, and evaluates newly earned badges.
 * Called once per graded review.
 * @param {string} themeId
 * @param {number} quality - 0-5, see sm2.QUALITY
 * @param {Date} [now]
 * @returns {Promise<{progress: import('../db/progressRepo.js').ThemeProgress, xpGained: number, leveledUp: boolean, newBadges: import('../badges/badges.js').BadgeDef[]}>}
 */
export async function awardReviewXp(themeId, quality, now = new Date()) {
  const current = await getProgress(themeId)
  const today = now.toISOString().slice(0, 10)

  const xpGained = xpForQuality(quality)
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
  })

  return { progress, xpGained, leveledUp: nextLevel > current.level, newBadges: newlyEarned }
}
