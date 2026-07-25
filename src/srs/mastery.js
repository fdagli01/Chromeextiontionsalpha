/**
 * Word mastery: the FSRS scheduler already knows how well each word is
 * held — `stability` is literally "days until recall drops to 90%" — but
 * that number was never shown to the player. These tiers turn it into
 * something visible and collectable: a seal earned by genuinely
 * remembering a word over time, which no amount of grinding in one
 * session can fake (stability only grows across spaced, successful
 * recalls).
 * @typedef {Object} MasteryTier
 * @property {'bronze'|'silver'|'gold'} id
 * @property {string} icon
 * @property {string} label
 * @property {number} minStability - days
 */

/** @type {MasteryTier[]} highest first */
export const MASTERY_TIERS = [
  { id: 'gold', icon: '🥇', label: 'Mastered', minStability: 90 },
  { id: 'silver', icon: '🥈', label: 'Retained', minStability: 30 },
  { id: 'bronze', icon: '🥉', label: 'Learned', minStability: 7 },
]

/**
 * The mastery seal a word currently holds, or null if it hasn't earned
 * one yet. A word that has never been reviewed never qualifies, however
 * high a seeded stability might look.
 * @param {{stability?: number, lastReviewedAt?: string|null}} word
 * @returns {MasteryTier | null}
 */
export function masteryForWord(word) {
  if (!word || !word.lastReviewedAt || word.stability == null) return null
  return MASTERY_TIERS.find((tier) => word.stability >= tier.minStability) ?? null
}

/**
 * Counts each mastery tier across a theme's archive, for the dossier's
 * collection summary.
 * @param {Array<{stability?: number, lastReviewedAt?: string|null}>} words
 * @returns {{gold: number, silver: number, bronze: number, total: number}}
 */
export function masterySummary(words) {
  const counts = { gold: 0, silver: 0, bronze: 0, total: words.length }
  for (const word of words) {
    const tier = masteryForWord(word)
    if (tier) counts[tier.id]++
  }
  return counts
}
