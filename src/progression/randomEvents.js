/**
 * Low-probability "intercept" events that fire on a correct recall, dropping
 * an unexpected bonus into an otherwise routine review. Kept rare so they
 * stay a pleasant surprise rather than an expectation, and injectable-random
 * so the roll is deterministically unit-testable.
 */

/** Chance (0-1) that a correct answer triggers an intercept event. */
export const INTERCEPT_CHANCE = 0.08

const INTERCEPTS = [
  { icon: '📡', label: 'Intercepted transmission', bonusXp: 15 },
  { icon: '🗝', label: 'Decrypted a dead drop', bonusXp: 20 },
  { icon: '📨', label: 'Recovered a lost dispatch', bonusXp: 10 },
]

/**
 * Rolls for a random intercept event on a correct recall. Returns the event
 * (icon/label/bonusXp) when it fires, or null on the common no-event case.
 * @param {() => number} [random] - returns a float in [0, 1); defaults to Math.random
 * @returns {{icon: string, label: string, bonusXp: number} | null}
 */
export function rollInterceptEvent(random = Math.random) {
  if (random() >= INTERCEPT_CHANCE) return null
  const index = Math.min(INTERCEPTS.length - 1, Math.floor(random() * INTERCEPTS.length))
  return INTERCEPTS[index]
}
