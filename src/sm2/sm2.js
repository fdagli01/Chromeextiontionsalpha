const MIN_EASE_FACTOR = 1.3
const INITIAL_EASE_FACTOR = 2.5

/**
 * Quality scores for the 4-button review UI (Anki-style), mapped onto the
 * classic SM-2 0-5 scale. AGAIN counts as a failed recall (quality < 3).
 */
export const QUALITY = {
  AGAIN: 1,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
}

/**
 * @typedef {Object} SchedulingState
 * @property {number} repetition
 * @property {number} interval - days
 * @property {number} easeFactor
 */

/**
 * @typedef {Object} SchedulingResult
 * @property {number} repetition
 * @property {number} interval
 * @property {number} easeFactor
 * @property {string} dueDate - ISO timestamp
 * @property {string} lastReviewedAt - ISO timestamp
 */

/**
 * Computes the next SM-2 scheduling state for a word given a review quality.
 *
 * Deviates from textbook SM-2 in one deliberate way: a failed recall
 * (quality < 3) sets interval to 0 rather than 1 day, so the word becomes
 * immediately due again and resurfaces in the *current* review session
 * instead of waiting until tomorrow. This is the mechanism behind
 * "wrong answers get prioritized for immediate re-drill".
 *
 * @param {SchedulingState} state - current scheduling state of the word
 * @param {number} quality - 0-5, see QUALITY for named presets
 * @param {Date} [now]
 * @returns {SchedulingResult}
 */
export function gradeReview(state, quality, now = new Date()) {
  if (quality < 0 || quality > 5) {
    throw new Error('quality must be between 0 and 5')
  }

  const { repetition, interval, easeFactor = INITIAL_EASE_FACTOR } = state

  let nextRepetition
  let nextInterval

  if (quality < 3) {
    nextRepetition = 0
    nextInterval = 0
  } else {
    nextRepetition = repetition + 1
    if (nextRepetition === 1) {
      nextInterval = 1
    } else if (nextRepetition === 2) {
      nextInterval = 6
    } else {
      nextInterval = Math.round(interval * easeFactor)
    }
  }

  const rawEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const nextEaseFactor = Math.max(MIN_EASE_FACTOR, Number(rawEaseFactor.toFixed(2)))

  const dueDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000)

  return {
    repetition: nextRepetition,
    interval: nextInterval,
    easeFactor: nextEaseFactor,
    dueDate: dueDate.toISOString(),
    lastReviewedAt: now.toISOString(),
  }
}

/** @returns {SchedulingState} the initial state for a brand-new word */
export function initialSchedulingState() {
  return { repetition: 0, interval: 0, easeFactor: INITIAL_EASE_FACTOR }
}
