import { exportBackup, importBackup } from './backup.js'
import { getSetting, setSetting } from './settingsRepo.js'

/**
 * Cloud backup via Google Drive's application data folder.
 *
 * The archive lives in IndexedDB, which is per-device: switching laptops
 * loses months of spaced repetition, and a manual file export only helps
 * the people disciplined enough to run it. This is the fix that keeps the
 * project's "no backend, no account of ours, no telemetry" shape — the
 * data goes to the user's OWN Drive, into appDataFolder, a hidden
 * per-application space that does not appear among their files and that
 * no other app can read. We never see it and never store it.
 *
 * Deliberately manual in both directions. An automatic pull would have to
 * merge two devices' review histories, and the honest options there are a
 * real merge (complex, easy to get subtly wrong) or last-write-wins
 * (silently destroys the loser's progress). Explicit "upload now" and
 * "restore" avoid the question entirely and never surprise anyone.
 */

const FILE_NAME = 'polyglot-chronicle-backup.json'
const APP_FOLDER = 'appDataFolder'
const FILES_API = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'

/** Setting key: ISO timestamp of the last successful upload. */
export const LAST_BACKUP_KEY = 'driveLastBackupAt'

/** Days after which the settings screen suggests backing up again. */
export const BACKUP_NUDGE_DAYS = 30

/**
 * Requests an OAuth token for the appdata scope. `interactive: false`
 * checks for an existing grant without ever showing a popup, which is
 * what the settings screen uses to decide whether to show "Connect" or
 * "Back up now".
 * @param {{interactive?: boolean}} [opts]
 * @returns {Promise<string|null>}
 */
export async function getAuthToken({ interactive = false } = {}) {
  try {
    const result = await chrome.identity.getAuthToken({ interactive })
    // MV3 resolves to an object; older shapes resolve to the bare string.
    const token = typeof result === 'string' ? result : result?.token
    return token ?? null
  } catch {
    // Not signed in, consent declined, or no OAuth client configured.
    return null
  }
}

/**
 * Forgets the cached token so the next request re-prompts. Used by
 * "disconnect", and after a 401, since a stale cached token is the usual
 * cause and Chrome will not refresh it on its own.
 * @param {string} token
 */
export async function invalidateToken(token) {
  try {
    await chrome.identity.removeCachedAuthToken({ token })
  } catch {
    /* nothing to invalidate */
  }
}

/**
 * Finds this extension's backup file inside the app data folder.
 * @param {string} token
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<string|null>} the file id
 */
export async function findBackupFileId(token, fetchImpl = fetch) {
  const query = new URLSearchParams({
    spaces: APP_FOLDER,
    q: `name = '${FILE_NAME}'`,
    fields: 'files(id,modifiedTime)',
  })
  const response = await fetchImpl(`${FILES_API}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`Drive list failed (${response.status})`)
  const data = await response.json()
  return data.files?.[0]?.id ?? null
}

/**
 * Uploads the current archive, replacing the previous backup rather than
 * accumulating copies — one file, always the latest.
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{words: number, at: string}>}
 */
export async function uploadBackup(fetchImpl = fetch) {
  const token = await getAuthToken({ interactive: true })
  if (!token) throw new Error('Google account not connected.')

  const backup = await exportBackup()
  const body = JSON.stringify(backup)
  const existingId = await findBackupFileId(token, fetchImpl)

  // Multipart: metadata part, then the payload, in one request.
  const boundary = `pc-${Date.now()}`
  const metadata = existingId ? {} : { name: FILE_NAME, parents: [APP_FOLDER] }
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n` +
    `--${boundary}--`

  const url = existingId
    ? `${UPLOAD_API}/${existingId}?uploadType=multipart`
    : `${UPLOAD_API}?uploadType=multipart`

  const response = await fetchImpl(url, {
    method: existingId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipart,
  })

  if (response.status === 401) {
    await invalidateToken(token)
    throw new Error('Google sign-in expired. Try again.')
  }
  if (!response.ok) throw new Error(`Upload failed (${response.status})`)

  const at = new Date().toISOString()
  await setSetting(LAST_BACKUP_KEY, at)
  return { words: backup.words.length, at }
}

/**
 * Pulls the cloud backup into this device. Additive, exactly like the
 * file import it reuses: nothing local is deleted.
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{wordsImported: number}>}
 */
export async function restoreBackup(fetchImpl = fetch) {
  const token = await getAuthToken({ interactive: true })
  if (!token) throw new Error('Google account not connected.')

  const fileId = await findBackupFileId(token, fetchImpl)
  if (!fileId) throw new Error('No cloud backup found for this account.')

  const response = await fetchImpl(`${FILES_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (response.status === 401) {
    await invalidateToken(token)
    throw new Error('Google sign-in expired. Try again.')
  }
  if (!response.ok) throw new Error(`Download failed (${response.status})`)

  return importBackup(await response.json())
}

/**
 * Whether to nudge the user about backing up: only once they have an
 * archive worth losing, and only if it has been a while.
 * @param {number} wordCount
 * @param {Date} [now]
 * @returns {Promise<boolean>}
 */
export async function shouldNudgeBackup(wordCount, now = new Date()) {
  if (wordCount < 20) return false
  const last = await getSetting(LAST_BACKUP_KEY, '')
  if (!last) return true
  const days = (now.getTime() - new Date(last).getTime()) / 86_400_000
  return days >= BACKUP_NUDGE_DAYS
}
