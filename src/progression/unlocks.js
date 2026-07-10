/**
 * Level thresholds at which secondary progress systems become visible.
 * Everything still accrues quietly in the background before unlocking
 * (faction reputation keeps counting, crisis eligibility keeps being
 * checked) — locking is a UI/visibility concern only, not a data one, so
 * nothing is lost by unlocking "late".
 */
export const UNLOCK_LEVELS = {
  factions: 3,
  crises: 4,
}

/**
 * @param {'factions'|'crises'} feature
 * @param {number} level
 * @returns {boolean}
 */
export function isUnlocked(feature, level) {
  return level >= (UNLOCK_LEVELS[feature] ?? 0)
}
