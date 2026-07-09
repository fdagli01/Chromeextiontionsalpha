import { STORE_WORDS, withStore } from './connection.js'
import { gradeReview } from '../sm2/sm2.js'

/**
 * @typedef {Object} WordEntry
 * @property {number} [id] - auto-assigned by IndexedDB
 * @property {string} themeId - e.g. "russian"
 * @property {string} term - the word in the source language
 * @property {string} translation - English translation (lingua franca layer)
 * @property {string} [fact] - short historical/thematic trivia, pre-authored
 * @property {string} createdAt - ISO timestamp
 * @property {number} repetition - SM-2: number of consecutive correct reviews
 * @property {number} interval - SM-2: days until next review
 * @property {number} easeFactor - SM-2: ease factor, starts at 2.5
 * @property {string} dueDate - ISO timestamp of next scheduled review
 * @property {string|null} lastReviewedAt - ISO timestamp of last review, or null
 */

/**
 * @param {{themeId: string, term: string, translation: string, fact?: string}} input
 * @returns {Promise<WordEntry>}
 */
export async function addWord({ themeId, term, translation, fact = '' }) {
  const now = new Date().toISOString()
  /** @type {WordEntry} */
  const word = {
    themeId,
    term,
    translation,
    fact,
    createdAt: now,
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
    lastReviewedAt: null,
  }

  const id = await withStore(STORE_WORDS, 'readwrite', (store) => store.add(word))
  return { ...word, id }
}

/**
 * @param {number} id
 * @returns {Promise<WordEntry | undefined>}
 */
export function getWord(id) {
  return withStore(STORE_WORDS, 'readonly', (store) => store.get(id))
}

/**
 * @param {number} id
 * @param {Partial<WordEntry>} patch
 * @returns {Promise<WordEntry>}
 */
export async function updateWord(id, patch) {
  const existing = await getWord(id)
  if (!existing) throw new Error(`Word ${id} not found`)
  const updated = { ...existing, ...patch, id }
  await withStore(STORE_WORDS, 'readwrite', (store) => store.put(updated))
  return updated
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteWord(id) {
  return withStore(STORE_WORDS, 'readwrite', (store) => store.delete(id))
}

/**
 * @param {string} themeId
 * @returns {Promise<WordEntry[]>}
 */
export function getWordsByTheme(themeId) {
  return withStore(STORE_WORDS, 'readonly', (store) =>
    store.index('byTheme').getAll(IDBKeyRange.only(themeId))
  )
}

/**
 * Returns words for a theme that are due for review at or before `asOf`,
 * sorted soonest-due first (SM-2 scheduling + wrong-answer prioritization
 * both flow from dueDate, since a wrong answer resets dueDate to now).
 * @param {string} themeId
 * @param {Date} [asOf]
 * @returns {Promise<WordEntry[]>}
 */
export async function getDueWords(themeId, asOf = new Date()) {
  const all = await getWordsByTheme(themeId)
  const cutoff = asOf.toISOString()
  return all
    .filter((w) => w.dueDate <= cutoff)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function getAllWords() {
  return withStore(STORE_WORDS, 'readonly', (store) => store.getAll())
}

/**
 * Grades a review for a word using SM-2 and persists the resulting
 * scheduling state. A failed recall (quality < 3) makes the word
 * immediately due again, prioritizing it in the current session.
 * @param {number} id
 * @param {number} quality - 0-5, see sm2.QUALITY for named presets
 * @returns {Promise<WordEntry>}
 */
export async function reviewWord(id, quality) {
  const word = await getWord(id)
  if (!word) throw new Error(`Word ${id} not found`)

  const { repetition, interval, easeFactor, dueDate, lastReviewedAt } = gradeReview(
    { repetition: word.repetition, interval: word.interval, easeFactor: word.easeFactor },
    quality
  )

  return updateWord(id, { repetition, interval, easeFactor, dueDate, lastReviewedAt })
}
