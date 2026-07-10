/**
 * A simplified FSRS (Free Spaced Repetition Scheduler) implementation,
 * replacing the classic SM-2 algorithm this app used before. Where SM-2
 * tracks a single "ease factor" per word, FSRS tracks two independent
 * numbers per word — `difficulty` (1-10, how inherently hard the word is)
 * and `stability` (days, how long the memory currently holds before
 * recall probability decays to ~90%) — which models forgetting far more
 * closely to how human memory actually behaves, and needs measurably
 * fewer reviews to hit the same retention in published benchmarks.
 *
 * This module reproduces the *shape* of FSRS v4 (a fixed power-law
 * forgetting curve, difficulty/stability update formulas, and the
 * well-known default weight vector), not a byte-exact port of any
 * particular reference implementation. It deliberately skips FSRS's
 * same-day/short-term sub-day scheduling, since this app only ever
 * schedules in whole days.
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** Review outcomes, mirroring Anki's 4-button grading. */
export const QUALITY = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
}

const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 10
const MIN_STABILITY = 0.1

/** Target recall probability the scheduler solves the next interval for. */
const DESIRED_RETENTION = 0.9

/**
 * The published FSRS v4 default weight vector (indices 0-16; FSRS's
 * same-day weights 17-18 are omitted since this app doesn't sub-schedule
 * within a day).
 */
const W = [
  0.4072, 1.1829, 3.1262, 15.4722, // 0-3: initial stability by grade (Again/Hard/Good/Easy)
  7.2102, 0.5316, // 4-5: initial difficulty base / spread
  1.0651, 0.0234, // 6-7: difficulty delta per grade / mean-reversion weight
  1.616, 0.1544, 1.0824, // 8-10: stability growth on a successful recall
  1.9813, 0.0953, 0.2975, 2.2042, // 11-14: stability after a failed recall
  0.2407, 2.9466, // 15-16: Hard penalty / Easy bonus multipliers
]

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Probability of successful recall after `elapsedDays` at the given
 * `stability` — a fixed-decay power-law forgetting curve. At
 * `elapsedDays === stability`, retrievability is always ~90%, which is
 * exactly why "stability" is defined in days at 90% retention.
 * @param {number} elapsedDays
 * @param {number} stability
 * @returns {number} 0-1
 */
function retrievability(elapsedDays, stability) {
  return Math.pow(1 + Math.max(0, elapsedDays) / (9 * stability), -1)
}

/**
 * @param {number} stability
 * @param {number} [desiredRetention]
 * @returns {number} days until retrievability decays to desiredRetention
 */
function intervalFromStability(stability, desiredRetention = DESIRED_RETENTION) {
  const days = 9 * stability * (1 / desiredRetention - 1)
  return Math.max(1, Math.round(days))
}

function initialStability(quality) {
  return W[quality - 1]
}

function initialDifficulty(quality) {
  return clamp(W[4] - W[5] * (quality - 3), MIN_DIFFICULTY, MAX_DIFFICULTY)
}

function nextDifficulty(difficulty, quality) {
  const delta = -W[6] * (quality - 3)
  const reverted = difficulty + delta
  const easyAnchor = initialDifficulty(QUALITY.EASY)
  const meanReverted = W[7] * easyAnchor + (1 - W[7]) * reverted
  return clamp(meanReverted, MIN_DIFFICULTY, MAX_DIFFICULTY)
}

function nextStabilityOnSuccess(difficulty, stability, r, quality) {
  const hardPenalty = quality === QUALITY.HARD ? W[15] : 1
  const easyBonus = quality === QUALITY.EASY ? W[16] : 1
  const growth =
    1 +
    Math.exp(W[8]) *
      (11 - difficulty) *
      Math.pow(stability, -W[9]) *
      (Math.exp((1 - r) * W[10]) - 1) *
      hardPenalty *
      easyBonus
  return Math.max(MIN_STABILITY, stability * growth)
}

function nextStabilityOnFailure(difficulty, stability, r) {
  const s = W[11] * Math.pow(difficulty, -W[12]) * (Math.pow(stability + 1, W[13]) - 1) * Math.exp((1 - r) * W[14])
  return Math.max(MIN_STABILITY, s)
}

/**
 * @typedef {Object} SrsState
 * @property {number} [difficulty] - 1-10, undefined for a never-reviewed word
 * @property {number} [stability] - days, undefined for a never-reviewed word
 * @property {string|null} lastReviewedAt - ISO timestamp, or null if never reviewed
 */

/**
 * @typedef {Object} SrsResult
 * @property {number} difficulty
 * @property {number} stability
 * @property {number} interval - days until next due
 * @property {string} dueDate - ISO timestamp
 * @property {string} lastReviewedAt - ISO timestamp
 */

/**
 * Computes the next FSRS scheduling state for a word given a review grade.
 *
 * Deviates from FSRS in the same deliberate way this app's SM-2 did: a
 * failed recall (AGAIN) forces interval to 0 rather than whatever the
 * formula would compute, so the word becomes immediately due again and
 * resurfaces in the *current* review session instead of waiting.
 *
 * @param {SrsState} state
 * @param {number} quality - 1-4, see QUALITY
 * @param {Date} [now]
 * @returns {SrsResult}
 */
export function gradeReview(state, quality, now = new Date()) {
  if (quality < QUALITY.AGAIN || quality > QUALITY.EASY) {
    throw new Error('quality must be between 1 and 4')
  }

  const isFirstReview = state.stability == null || state.difficulty == null
  let difficulty
  let stability

  if (isFirstReview) {
    difficulty = initialDifficulty(quality)
    stability = initialStability(quality)
  } else {
    const elapsedDays = state.lastReviewedAt
      ? Math.max(0, (now.getTime() - new Date(state.lastReviewedAt).getTime()) / DAY_MS)
      : 0
    const r = retrievability(elapsedDays, state.stability)
    difficulty = nextDifficulty(state.difficulty, quality)
    stability =
      quality === QUALITY.AGAIN
        ? nextStabilityOnFailure(state.difficulty, state.stability, r)
        : nextStabilityOnSuccess(state.difficulty, state.stability, r, quality)
  }

  const interval = quality === QUALITY.AGAIN ? 0 : intervalFromStability(stability)
  const dueDate = new Date(now.getTime() + interval * DAY_MS)

  return {
    difficulty,
    stability,
    interval,
    dueDate: dueDate.toISOString(),
    lastReviewedAt: now.toISOString(),
  }
}

/** @returns {SrsState} the initial state for a brand-new word */
export function initialSchedulingState() {
  return { difficulty: undefined, stability: undefined, lastReviewedAt: null }
}

/**
 * Bootstraps an FSRS starting state from a word still carrying only the
 * old SM-2 fields (repetition/interval/easeFactor), so upgrading doesn't
 * reset anyone's scheduling progress back to square one. The mapping is
 * intentionally approximate — FSRS's difficulty self-corrects over
 * subsequent reviews via mean-reversion regardless of the exact starting
 * value.
 * @param {{interval?: number, easeFactor?: number, lastReviewedAt?: string|null}} word
 * @returns {SrsState}
 */
export function bootstrapFromSm2(word) {
  const hasPriorProgress = (word.interval ?? 0) > 0 && word.lastReviewedAt
  if (!hasPriorProgress) return initialSchedulingState()

  const easeFactor = word.easeFactor ?? 2.5
  const difficulty = clamp(10 - (easeFactor - 1.3) * 5, MIN_DIFFICULTY, MAX_DIFFICULTY)
  const stability = Math.max(MIN_STABILITY, word.interval)

  return { difficulty, stability, lastReviewedAt: word.lastReviewedAt }
}
