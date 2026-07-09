import { STORE_PROGRESS, withStore } from './connection.js'

/**
 * @typedef {Object} ThemeProgress
 * @property {string} themeId
 * @property {number} xp
 * @property {number} level
 * @property {number} streak - consecutive days with at least one review
 * @property {string|null} lastActiveDate - ISO date (YYYY-MM-DD) of last activity
 */

/**
 * @param {string} themeId
 * @returns {ThemeProgress}
 */
function emptyProgress(themeId) {
  return { themeId, xp: 0, level: 1, streak: 0, lastActiveDate: null }
}

/**
 * @param {string} themeId
 * @returns {Promise<ThemeProgress>}
 */
export async function getProgress(themeId) {
  const existing = await withStore(STORE_PROGRESS, 'readonly', (store) => store.get(themeId))
  return existing ?? emptyProgress(themeId)
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
