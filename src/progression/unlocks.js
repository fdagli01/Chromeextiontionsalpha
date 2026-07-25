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

/** Human-readable names for the level-gated features, for cliffhanger copy. */
const FEATURE_LABELS = {
  factions: 'Factions',
  crises: 'Crises',
}

/**
 * The next locked feature the player is approaching, for a session-closing
 * "one more push" cliffhanger. Returns the nearest not-yet-unlocked feature
 * with how many levels remain, or null once everything is unlocked.
 * @param {number} level
 * @returns {{label: string, unlockLevel: number, levelsAway: number} | null}
 */
export function nextFeatureUnlock(level) {
  const upcoming = Object.entries(UNLOCK_LEVELS)
    .filter(([, unlockLevel]) => level < unlockLevel)
    .sort((a, b) => a[1] - b[1])
  if (upcoming.length === 0) return null
  const [feature, unlockLevel] = upcoming[0]
  return {
    label: FEATURE_LABELS[feature] ?? feature,
    unlockLevel,
    levelsAway: unlockLevel - level,
  }
}
