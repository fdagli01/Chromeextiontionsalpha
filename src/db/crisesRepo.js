import { STORE_CRISES, withStore } from './connection.js'

/**
 * @typedef {Object} CrisisRecord
 * @property {number} [id] - auto-assigned by IndexedDB
 * @property {string} themeId
 * @property {string} templateId - matches a CrisisTemplate.id in the theme config
 * @property {string} triggeredAt - ISO timestamp
 * @property {string|null} resolvedAt - ISO timestamp, or null while still pending
 * @property {'won'|'lost'|'expired'|null} outcome
 * @property {number} score - words correctly recalled before the crisis ended
 */

/**
 * @param {string} themeId
 * @param {string} templateId
 * @param {Date} [now]
 * @returns {Promise<CrisisRecord>}
 */
export async function logCrisisTriggered(themeId, templateId, now = new Date()) {
  const record = {
    themeId,
    templateId,
    triggeredAt: now.toISOString(),
    resolvedAt: null,
    outcome: null,
    score: 0,
  }
  const id = await withStore(STORE_CRISES, 'readwrite', (store) => store.add(record))
  return { ...record, id }
}

/**
 * @param {number} id
 * @param {'won'|'lost'|'expired'} outcome
 * @param {number} score
 * @param {Date} [now]
 * @returns {Promise<void>}
 */
export async function resolveCrisis(id, outcome, score, now = new Date()) {
  const all = await withStore(STORE_CRISES, 'readonly', (store) => store.getAll())
  const existing = all.find((c) => c.id === id)
  if (!existing) return
  await withStore(STORE_CRISES, 'readwrite', (store) =>
    store.put({ ...existing, outcome, score, resolvedAt: now.toISOString() })
  )
}

/**
 * Returns the most recently triggered crisis for a theme (used to enforce a
 * cooldown so crises don't fire back-to-back), or null if none yet.
 * @param {string} themeId
 * @returns {Promise<CrisisRecord | null>}
 */
export async function getLastCrisisForTheme(themeId) {
  const all = await withStore(STORE_CRISES, 'readonly', (store) =>
    store.index('byTheme').getAll(IDBKeyRange.only(themeId))
  )
  if (all.length === 0) return null
  return all.reduce((latest, c) => (c.triggeredAt > latest.triggeredAt ? c : latest))
}
