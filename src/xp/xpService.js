import { getProgress, saveProgress } from '../db/progressRepo.js'
import { computeStreak, levelForXp, xpForQuality } from './xp.js'

/**
 * Records a review outcome against a theme's progress: adds XP, recomputes
 * level, and updates the daily streak. Called once per graded review.
 * @param {string} themeId
 * @param {number} quality - 0-5, see sm2.QUALITY
 * @param {Date} [now]
 * @returns {Promise<{progress: import('../db/progressRepo.js').ThemeProgress, xpGained: number, leveledUp: boolean}>}
 */
export async function awardReviewXp(themeId, quality, now = new Date()) {
  const current = await getProgress(themeId)
  const today = now.toISOString().slice(0, 10)

  const xpGained = xpForQuality(quality)
  const nextXp = current.xp + xpGained
  const nextLevel = levelForXp(nextXp)
  const nextStreak = computeStreak(current.lastActiveDate, today, current.streak)

  const progress = await saveProgress(themeId, {
    xp: nextXp,
    level: nextLevel,
    streak: nextStreak,
    lastActiveDate: today,
  })

  return { progress, xpGained, leveledUp: nextLevel > current.level }
}
