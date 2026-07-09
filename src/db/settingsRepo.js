import { STORE_SETTINGS, withStore } from './connection.js'

/**
 * @param {string} key
 * @param {*} defaultValue
 * @returns {Promise<*>}
 */
export async function getSetting(key, defaultValue = undefined) {
  const record = await withStore(STORE_SETTINGS, 'readonly', (store) => store.get(key))
  return record ? record.value : defaultValue
}

/**
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void>}
 */
export function setSetting(key, value) {
  return withStore(STORE_SETTINGS, 'readwrite', (store) => store.put({ key, value }))
}
