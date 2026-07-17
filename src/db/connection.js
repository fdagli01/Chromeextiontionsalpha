const DB_NAME = 'polyglot-chronicle'
const DB_VERSION = 3

export const STORE_WORDS = 'words'
export const STORE_PROGRESS = 'progress'
export const STORE_SETTINGS = 'settings'
export const STORE_FACTIONS = 'factions'
export const STORE_CRISES = 'crises'
export const STORE_ARTIFACTS = 'artifacts'

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null

/**
 * Opens (or reuses) the single IndexedDB connection for the extension.
 * Safe to call repeatedly; the underlying open only happens once per session.
 * @returns {Promise<IDBDatabase>}
 */
export function openDB() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_WORDS)) {
        const words = db.createObjectStore(STORE_WORDS, { keyPath: 'id', autoIncrement: true })
        words.createIndex('byTheme', 'themeId', { unique: false })
        words.createIndex('byThemeAndDueDate', ['themeId', 'dueDate'], { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        db.createObjectStore(STORE_PROGRESS, { keyPath: 'themeId' })
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' })
      }

      if (!db.objectStoreNames.contains(STORE_FACTIONS)) {
        const factions = db.createObjectStore(STORE_FACTIONS, { keyPath: 'factionId' })
        factions.createIndex('byTheme', 'themeId', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_CRISES)) {
        const crises = db.createObjectStore(STORE_CRISES, { keyPath: 'id', autoIncrement: true })
        crises.createIndex('byTheme', 'themeId', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_ARTIFACTS)) {
        // keyPath is a synthetic "themeId:artifactId" string rather than a
        // compound key — plain string keys are simpler to look up directly
        // without building an IDBKeyRange, and there are only ever two
        // records per theme.
        const artifacts = db.createObjectStore(STORE_ARTIFACTS, { keyPath: 'id' })
        artifacts.createIndex('byTheme', 'themeId', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

/**
 * Wraps an IDBRequest in a Promise.
 * @template T
 * @param {IDBRequest<T>} request
 * @returns {Promise<T>}
 */
export function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Runs a callback against an object store inside a transaction and resolves
 * once the transaction completes (not just when the request succeeds), so
 * callers can safely chain further reads in the same tick if needed.
 * @template T
 * @param {string} storeName
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest<T>} callback
 * @returns {Promise<T>}
 */
export async function withStore(storeName, mode, callback) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const request = callback(store)

    let result
    request.onsuccess = () => {
      result = request.result
    }
    request.onerror = () => reject(request.error)

    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** Only for tests: forces a fresh connection on the next openDB() call. */
export function _resetConnectionForTests() {
  dbPromise = null
}
