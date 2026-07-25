/**
 * Pure term-matching helpers for the page-highlighting content script.
 * Kept free of DOM and chrome.* so the matching rules — the part that can
 * silently produce embarrassing mid-word highlights — are unit-testable.
 */

/** Terms shorter than this are never highlighted: two-letter words match
 * constantly inside ordinary prose and read as noise, not review prompts. */
export const MIN_TERM_LENGTH = 3

/** @param {string} term */
function escapeRegex(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Builds one alternation regex for every due term. Longest terms first so a
 * multi-word phrase ("no pasarán") wins over any shorter term it contains.
 * Word boundaries are expressed as Unicode-letter lookarounds rather than
 * \b, which treats every Cyrillic (and any non-ASCII) letter as a boundary
 * and would happily highlight the middle of a Russian word.
 * @param {string[]} terms
 * @returns {RegExp | null} a global, case-insensitive regex, or null if no term is usable
 */
export function buildTermRegex(terms) {
  const usable = [...new Set(terms.map((t) => t.trim()).filter((t) => t.length >= MIN_TERM_LENGTH))]
  if (usable.length === 0) return null
  usable.sort((a, b) => b.length - a.length)
  const alternation = usable.map(escapeRegex).join('|')
  return new RegExp(`(?<![\\p{L}\\p{N}])(${alternation})(?![\\p{L}\\p{N}])`, 'giu')
}
