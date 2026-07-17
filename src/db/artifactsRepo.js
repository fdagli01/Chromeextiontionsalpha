import { STORE_ARTIFACTS, withStore } from './connection.js'

/**
 * @typedef {Object} ArtifactRecord
 * @property {string} id - "themeId:artifactId"
 * @property {string} themeId
 * @property {string} artifactId
 * @property {number} fragments - 0-3
 */

/**
 * @param {string} themeId
 * @param {string} artifactId
 * @returns {string}
 */
function recordId(themeId, artifactId) {
  return `${themeId}:${artifactId}`
}

/**
 * @param {string} themeId
 * @param {string} artifactId
 * @returns {Promise<ArtifactRecord>}
 */
export async function getArtifactRecord(themeId, artifactId) {
  const existing = await withStore(STORE_ARTIFACTS, 'readonly', (store) => store.get(recordId(themeId, artifactId)))
  return existing ?? { id: recordId(themeId, artifactId), themeId, artifactId, fragments: 0 }
}

/**
 * @param {string} themeId
 * @returns {Promise<ArtifactRecord[]>}
 */
export async function getArtifactRecordsForTheme(themeId) {
  const records = await withStore(STORE_ARTIFACTS, 'readonly', (store) =>
    store.index('byTheme').getAll(themeId)
  )
  return records ?? []
}

/**
 * @param {string} themeId
 * @param {string} artifactId
 * @param {number} fragments
 * @returns {Promise<ArtifactRecord>}
 */
export async function setArtifactFragments(themeId, artifactId, fragments) {
  const record = { id: recordId(themeId, artifactId), themeId, artifactId, fragments }
  await withStore(STORE_ARTIFACTS, 'readwrite', (store) => store.put(record))
  return record
}

/**
 * Every artifact record across every theme — used by backup export so a
 * user's Vault progress travels with their JSON backup, same as words and
 * progress.
 * @returns {Promise<ArtifactRecord[]>}
 */
export async function getAllArtifactRecords() {
  const records = await withStore(STORE_ARTIFACTS, 'readonly', (store) => store.getAll())
  return records ?? []
}

/**
 * @param {ArtifactRecord[]} records
 * @returns {Promise<void>}
 */
export async function restoreArtifactRecords(records) {
  for (const record of records) {
    await withStore(STORE_ARTIFACTS, 'readwrite', (store) => store.put(record))
  }
}
