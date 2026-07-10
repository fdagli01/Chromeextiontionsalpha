import { STORE_FACTIONS, withStore } from './connection.js'
import { getFactionsForTheme } from '../factions/factions.js'

/**
 * @typedef {Object} FactionProgress
 * @property {string} factionId
 * @property {string} themeId
 * @property {number} reputation - cumulative points earned
 * @property {number} wordsContributed - count of correct recalls credited to this faction
 * @property {string|null} lastGainAt - ISO timestamp of the last reputation gain
 */

/**
 * @param {string} factionId
 * @param {string} themeId
 * @returns {FactionProgress}
 */
function emptyProgress(factionId, themeId) {
  return { factionId, themeId, reputation: 0, wordsContributed: 0, lastGainAt: null }
}

/**
 * @param {string} factionId
 * @param {string} themeId
 * @returns {Promise<FactionProgress>}
 */
export async function getFactionProgress(factionId, themeId) {
  const existing = await withStore(STORE_FACTIONS, 'readonly', (store) => store.get(factionId))
  return existing ?? emptyProgress(factionId, themeId)
}

/**
 * Returns every faction defined for a theme, merged with its saved
 * reputation progress (zeroed out for factions the player hasn't fed yet).
 * @param {string} themeId
 * @returns {Promise<FactionProgress[]>}
 */
export async function getFactionsByTheme(themeId) {
  const defs = getFactionsForTheme(themeId)
  return Promise.all(defs.map((def) => getFactionProgress(def.factionId, themeId)))
}

/**
 * Adds reputation to a faction, bumping its contribution count and
 * last-gain timestamp. Creates the record on first contribution.
 * @param {string} factionId
 * @param {string} themeId
 * @param {number} amount
 * @param {Date} [now]
 * @returns {Promise<FactionProgress>}
 */
export async function awardReputation(factionId, themeId, amount, now = new Date()) {
  const current = await getFactionProgress(factionId, themeId)
  const updated = {
    ...current,
    reputation: current.reputation + amount,
    wordsContributed: current.wordsContributed + 1,
    lastGainAt: now.toISOString(),
  }
  await withStore(STORE_FACTIONS, 'readwrite', (store) => store.put(updated))
  return updated
}
