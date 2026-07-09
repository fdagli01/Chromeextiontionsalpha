import { getRussianFact } from './russian.js'

/** @type {Record<string, (term: string) => string>} */
const FACT_PROVIDERS = {
  russian: getRussianFact,
}

/**
 * @param {string} themeId
 * @param {string} term
 * @returns {string} a pre-authored fact, or '' if none exists for this term
 */
export function getFact(themeId, term) {
  const provider = FACT_PROVIDERS[themeId]
  return provider ? provider(term) : ''
}
