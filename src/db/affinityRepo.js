import { STORE_AFFINITY, withStore } from './connection.js'

/**
 * @typedef {Object} AffinityRecord
 * @property {string} id - "themeId:personaId"
 * @property {string} themeId
 * @property {string} personaId
 * @property {number} trust - 0-100
 * @property {string|null} lastTrustDate - ISO date (YYYY-MM-DD) trustToday is counting for
 * @property {number} trustToday - trust gained on lastTrustDate, capped per day
 * @property {boolean} allyRewardClaimed - whether the one-time Ally reward has been granted
 */

/** Every persona starts wary rather than neutral — trust is earned, not assumed. */
export const STARTING_TRUST = 10

/**
 * @param {string} themeId
 * @param {string} personaId
 * @returns {string}
 */
function recordId(themeId, personaId) {
  return `${themeId}:${personaId}`
}

/**
 * @param {string} themeId
 * @param {string} personaId
 * @returns {Promise<AffinityRecord>}
 */
export async function getAffinityRecord(themeId, personaId) {
  const existing = await withStore(STORE_AFFINITY, 'readonly', (store) =>
    store.get(recordId(themeId, personaId))
  )
  return (
    existing ?? {
      id: recordId(themeId, personaId),
      themeId,
      personaId,
      trust: STARTING_TRUST,
      lastTrustDate: null,
      trustToday: 0,
      allyRewardClaimed: false,
    }
  )
}

/**
 * @param {string} themeId
 * @returns {Promise<AffinityRecord[]>}
 */
export async function getAffinityRecordsForTheme(themeId) {
  const records = await withStore(STORE_AFFINITY, 'readonly', (store) =>
    store.index('byTheme').getAll(themeId)
  )
  return records ?? []
}

/**
 * @param {AffinityRecord} record
 * @returns {Promise<AffinityRecord>}
 */
export async function saveAffinityRecord(record) {
  await withStore(STORE_AFFINITY, 'readwrite', (store) => store.put(record))
  return record
}

/**
 * @returns {Promise<AffinityRecord[]>}
 */
export async function getAllAffinityRecords() {
  const records = await withStore(STORE_AFFINITY, 'readonly', (store) => store.getAll())
  return records ?? []
}

/**
 * @param {AffinityRecord[]} records
 * @returns {Promise<void>}
 */
export async function restoreAffinityRecords(records) {
  for (const record of records) {
    await withStore(STORE_AFFINITY, 'readwrite', (store) => store.put(record))
  }
}
