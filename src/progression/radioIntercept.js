/**
 * Radio dictation crisis: a rare, harder variant of a review — instead of
 * multiple choice, the term is spoken twice through static and the screen
 * goes dark. The player types what they heard from memory alone. This is
 * the one genuinely "boss fight" moment in the review loop, so it fires
 * less often than an NPC intercept and is judged with a small typo
 * tolerance (accents/case are the usual casualties of typing fast under
 * pressure, not a real miss).
 */

/** Chance a due card arrives as a radio dictation crisis instead of normal review. */
export const RADIO_CRISIS_CHANCE = 0.03

/**
 * Rolls whether the next due card becomes a radio dictation crisis.
 * @param {() => number} [random]
 * @returns {boolean}
 */
export function rollRadioCrisis(random = Math.random) {
  return random() < RADIO_CRISIS_CHANCE
}

/**
 * Case/accent-insensitive Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function editDistance(a, b) {
  const s = a.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const t = b.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const rows = s.length + 1
  const cols = t.length + 1
  const d = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)])
  for (let j = 0; j < cols; j++) d[0][j] = j
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[rows - 1][cols - 1]
}

/**
 * Judges a typed dictation attempt against the true term, tolerating one
 * typo per ~6 characters (minimum tolerance of 1) so a fast, pressured
 * typist isn't punished for a stray missed accent.
 * @param {string} typed
 * @param {string} truth
 * @returns {boolean}
 */
export function judgeDictation(typed, truth) {
  if (!typed?.trim()) return false
  const tolerance = Math.max(1, Math.floor(truth.length / 6))
  return editDistance(typed, truth) <= tolerance
}
