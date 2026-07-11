import { STORE_WORDS, withStore } from './connection.js'
import { bootstrapFromSm2, gradeReview, QUALITY } from '../srs/fsrs.js'

/**
 * @typedef {Object} WordEntry
 * @property {number} [id] - auto-assigned by IndexedDB
 * @property {string} themeId - e.g. "russian"
 * @property {string} term - the word in the source language
 * @property {string} translation - English translation (lingua franca layer)
 * @property {string} [fact] - short historical/thematic trivia, pre-authored
 * @property {string} [transliteration] - Latin pronunciation hint, e.g. "radost'"
 * @property {string} [exampleSentence] - a sentence using the term, in the source language
 * @property {string} [exampleTranslation] - Turkish translation of exampleSentence
 * @property {string} [philosophyNote] - one-line philosophical cross-reference, for conceptually loaded terms
 * @property {EtymologyEntry} [etymology] - AI-generated etymological/historical-linguistics breakdown
 * @property {string} createdAt - ISO timestamp
 * @property {number} [difficulty] - FSRS: 1 (easiest) - 10 (hardest), unset until first reviewed
 * @property {number} [stability] - FSRS: days until recall probability decays to 90%, unset until first reviewed
 * @property {number} interval - days until next review
 * @property {string} dueDate - ISO timestamp of next scheduled review
 * @property {string|null} lastReviewedAt - ISO timestamp of last review, or null
 * @property {boolean} struggling - true after a missed recall, cleared on the next correct one
 */

/**
 * @typedef {Object} EtymologyEntry
 * @property {string} origin
 * @property {string} rootLanguage
 * @property {string} evolution
 * @property {string} thematicTie
 */

/**
 * @param {{themeId: string, term: string, translation: string, fact?: string, transliteration?: string, exampleSentence?: string, exampleTranslation?: string, philosophyNote?: string, etymology?: EtymologyEntry}} input
 * @returns {Promise<WordEntry>}
 */
export async function addWord({
  themeId,
  term,
  translation,
  fact = '',
  transliteration = '',
  exampleSentence = '',
  exampleTranslation = '',
  philosophyNote = '',
  etymology = undefined,
}) {
  const now = new Date().toISOString()
  /** @type {WordEntry} */
  const word = {
    themeId,
    term,
    translation,
    fact,
    transliteration,
    exampleSentence,
    exampleTranslation,
    philosophyNote,
    ...(etymology ? { etymology } : {}),
    createdAt: now,
    interval: 0,
    dueDate: now,
    lastReviewedAt: null,
    struggling: false,
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

/** Days since a word's last review (or creation, if never reviewed) before it counts as a "cold case". */
const COLD_CASE_THRESHOLD_DAYS = 21

/**
 * Surfaces due words that have gone unreviewed the longest — words on the
 * edge of being forgotten entirely — for a special "cold case" mini-session
 * distinct from the routine due queue. Only draws from words already due,
 * so this never invents extra review pressure; it just re-frames the most
 * neglected slice of it.
 * @param {string} themeId
 * @param {Date} [asOf]
 * @param {number} [limit]
 * @returns {Promise<WordEntry[]>}
 */
export async function getColdCaseWords(themeId, asOf = new Date(), limit = 5) {
  const due = await getDueWords(themeId, asOf)
  const cutoff = new Date(asOf.getTime() - COLD_CASE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()
  return due
    .filter((w) => (w.lastReviewedAt ?? w.createdAt) <= cutoff)
    .sort((a, b) => (a.lastReviewedAt ?? a.createdAt).localeCompare(b.lastReviewedAt ?? b.createdAt))
    .slice(0, limit)
}

/**
 * Returns up to `count` random words from a theme, excluding one word.
 * Used to build multiple-choice distractors.
 * @param {string} themeId
 * @param {number} excludeId
 * @param {number} count
 * @returns {Promise<WordEntry[]>}
 */
export async function getRandomWords(themeId, excludeId, count) {
  const all = await getWordsByTheme(themeId)
  const pool = all.filter((w) => w.id !== excludeId)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

/**
 * Grades a review for a word using FSRS and persists the resulting
 * scheduling state. A failed recall (AGAIN) makes the word immediately due
 * again, prioritizing it in the current session, and marks it `struggling`
 * until the next correct recall clears the flag. Words still carrying only
 * the old SM-2 fields (from before this app switched schedulers) have their
 * progress bootstrapped into an equivalent starting difficulty/stability
 * instead of being reset to a brand-new word.
 * @param {number} id
 * @param {number} quality - 1-4, see srs/fsrs.js QUALITY for named presets
 * @returns {Promise<WordEntry>}
 */
export async function reviewWord(id, quality) {
  const word = await getWord(id)
  if (!word) throw new Error(`Word ${id} not found`)

  const srsState =
    word.stability == null && word.difficulty == null
      ? bootstrapFromSm2(word)
      : { difficulty: word.difficulty, stability: word.stability, lastReviewedAt: word.lastReviewedAt }

  const { difficulty, stability, interval, dueDate, lastReviewedAt } = gradeReview(srsState, quality)

  return updateWord(id, {
    difficulty,
    stability,
    interval,
    dueDate,
    lastReviewedAt,
    struggling: quality === QUALITY.AGAIN,
  })
}
