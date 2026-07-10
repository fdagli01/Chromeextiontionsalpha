import { STORE_WORDS, withStore } from './connection.js'
import { getAllWords } from './wordsRepo.js'
import { getProgress, saveProgress } from './progressRepo.js'
import { listThemes } from '../themes/index.js'

const BACKUP_VERSION = 1

/**
 * Serializes every word and every theme's progress into a single portable
 * JSON object — a safety net independent of the browser's storage (which
 * resets if the unpacked extension's folder path ever changes, since Chrome
 * derives the extension ID, and therefore the IndexedDB partition, from it).
 * @returns {Promise<{version: number, exportedAt: string, words: object[], progress: object[]}>}
 */
export async function exportBackup() {
  const words = await getAllWords()
  const progress = await Promise.all(listThemes().map((theme) => getProgress(theme.id)))

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    // Drop the auto-incremented id — importing re-inserts as new rows so it
    // never collides with whatever ids already exist in the target database.
    words: words.map(({ id, ...rest }) => rest),
    progress,
  }
}

/**
 * Restores words and progress from a backup produced by exportBackup().
 * Adds words as new rows (does not de-duplicate against existing ones) and
 * merges progress per theme, so importing into an already-populated
 * database is additive rather than destructive.
 * @param {unknown} data
 * @returns {Promise<{wordsImported: number, progressImported: number}>}
 */
export async function importBackup(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.words)) {
    throw new Error('Invalid backup file: no word list found.')
  }

  for (const word of data.words) {
    const { id, ...rest } = word
    await withStore(STORE_WORDS, 'readwrite', (store) => store.add(rest))
  }

  const progressList = Array.isArray(data.progress) ? data.progress : []
  for (const progress of progressList) {
    if (!progress?.themeId) continue
    await saveProgress(progress.themeId, progress)
  }

  return { wordsImported: data.words.length, progressImported: progressList.length }
}
