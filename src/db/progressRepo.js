import { STORE_PROGRESS, withStore } from './connection.js'

/**
 * @typedef {Object} ThemeProgress
 * @property {string} themeId
 * @property {number} xp
 * @property {number} level
 * @property {number} streak - consecutive days with at least one review
 * @property {string|null} lastActiveDate - ISO date (YYYY-MM-DD) of last activity
 * @property {string[]} badges - ids of earned badges, see badges/badges.js
 * @property {string|null} dailyQuestDate - ISO date (YYYY-MM-DD) dailyReviewCount is counting for
 * @property {number} dailyReviewCount - reviews graded on dailyQuestDate
 * @property {boolean} dailyQuestClaimed - whether today's quest bonus XP has been awarded
 * @property {string[]} secretsUnlocked - lowercased terms whose one-time secret anecdote has been revealed
 */

/**
 * @param {string} themeId
 * @returns {ThemeProgress}
 */
function emptyProgress(themeId) {
  return {
    themeId,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    badges: [],
    dailyQuestDate: null,
    dailyReviewCount: 0,
    dailyQuestClaimed: false,
    secretsUnlocked: [],
  }
}

/**
 * @param {string} themeId
 * @returns {Promise<ThemeProgress>}
 */
export async function getProgress(themeId) {
  const existing = await withStore(STORE_PROGRESS, 'readonly', (store) => store.get(themeId))
  if (!existing) return emptyProgress(themeId)
  return {
    badges: [],
    dailyQuestDate: null,
    dailyReviewCount: 0,
    dailyQuestClaimed: false,
    secretsUnlocked: [],
    ...existing,
  }
}

/**
 * @param {string} themeId
 * @param {Partial<ThemeProgress>} patch
 * @returns {Promise<ThemeProgress>}
 */
export async function saveProgress(themeId, patch) {
  const current = await getProgress(themeId)
  const updated = { ...current, ...patch, themeId }
  await withStore(STORE_PROGRESS, 'readwrite', (store) => store.put(updated))
  return updated
}
