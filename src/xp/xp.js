import { QUALITY } from '../srs/fsrs.js'

/**
 * XP awarded per review outcome. A failed recall (AGAIN) earns no XP —
 * capturing/reviewing is free, but XP rewards actual retention.
 * @type {Record<number, number>}
 */
export const XP_BY_QUALITY = {
  [QUALITY.AGAIN]: 0,
  [QUALITY.HARD]: 5,
  [QUALITY.GOOD]: 10,
  [QUALITY.EASY]: 15,
}

/**
 * @param {number} quality
 * @returns {number}
 */
export function xpForQuality(quality) {
  return XP_BY_QUALITY[quality] ?? 0
}

/**
 * Triangular XP curve: level L requires 100*(L-1) more XP than level L-1,
 * so cumulative XP needed to reach level L is 100 * L*(L-1)/2. Leveling
 * gets progressively harder without needing a lookup table.
 * @param {number} xp
 * @returns {number}
 */
export function levelForXp(xp) {
  let level = 1
  let cumulative = 0
  let increment = 100
  while (xp >= cumulative + increment) {
    cumulative += increment
    level += 1
    increment += 100
  }
  return level
}

/**
 * @param {number} level
 * @returns {number} cumulative XP required to reach this level
 */
export function xpRequiredForLevel(level) {
  let cumulative = 0
  let increment = 100
  for (let l = 1; l < level; l++) {
    cumulative += increment
    increment += 100
  }
  return cumulative
}

/**
 * @param {number} xp
 * @returns {{level: number, xpIntoLevel: number, xpToNextLevel: number}}
 */
export function levelProgress(xp) {
  const level = levelForXp(xp)
  const currentLevelFloor = xpRequiredForLevel(level)
  const nextLevelFloor = xpRequiredForLevel(level + 1)
  return {
    level,
    xpIntoLevel: xp - currentLevelFloor,
    xpToNextLevel: nextLevelFloor - currentLevelFloor,
  }
}

/**
 * @param {string[]} rankNames - theme-specific rank names, ordered by level
 * @param {number} level
 * @returns {string} the rank name for this level, clamped to the last known rank
 */
export function rankForLevel(rankNames, level) {
  if (!rankNames || rankNames.length === 0) return `Level ${level}`
  const index = Math.min(level - 1, rankNames.length - 1)
  return rankNames[index]
}

/**
 * Computes the updated streak count given the last active date and today's
 * date (both as YYYY-MM-DD strings). Consecutive days increment the streak,
 * a gap resets it to 1, and re-triggering on the same day is a no-op.
 * @param {string|null} lastActiveDate
 * @param {string} today - YYYY-MM-DD
 * @param {number} previousStreak
 * @returns {number}
 */
export function computeStreak(lastActiveDate, today, previousStreak) {
  if (lastActiveDate === today) return previousStreak

  if (lastActiveDate) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    if (lastActiveDate === yesterdayStr) return previousStreak + 1
  }

  return 1
}

/**
 * Maps a streak count to a visual growth tier (0-3), used to scale the
 * flame indicator so a long streak actually feels bigger, not just numeric.
 * @param {number} streak
 * @returns {0 | 1 | 2 | 3}
 */
export function streakTier(streak) {
  if (streak >= 14) return 3
  if (streak >= 7) return 2
  if (streak >= 3) return 1
  return 0
}

/**
 * Momentum multiplier tiers for a consecutive-correct combo. Answering
 * several in a row builds "momentum" that boosts XP, giving the review loop
 * a risk/reward rhythm — a wrong answer resets the combo (and the bonus) to
 * zero. Tiers are stepwise (not continuous) so the payoff is legible: the
 * player can feel each new multiplier land.
 * @param {number} combo - consecutive-correct count (0 = no combo yet)
 * @returns {number} XP multiplier (1 when there's no meaningful combo)
 */
export function comboMultiplier(combo) {
  if (combo >= 12) return 3
  if (combo >= 8) return 2.5
  if (combo >= 5) return 2
  if (combo >= 3) return 1.5
  return 1
}

/**
 * Fraction (0-1) of the way from the current combo multiplier tier to the
 * next, for a filling "momentum meter". Returns 1 at the top tier so the bar
 * reads as maxed out rather than empty.
 * @param {number} combo
 * @returns {number}
 */
export function comboMeterFill(combo) {
  const thresholds = [3, 5, 8, 12]
  if (combo >= thresholds[thresholds.length - 1]) return 1
  let lower = 0
  for (const t of thresholds) {
    if (combo < t) return (combo - lower) / (t - lower)
    lower = t
  }
  return 1
}
