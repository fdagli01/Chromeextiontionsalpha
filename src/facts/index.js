import { getRussianExample, getRussianFact, getRussianPhilosophy } from './russian.js'
import { getItalianExample, getItalianFact, getItalianPhilosophy } from './italian.js'
import { getPortugueseExample, getPortugueseFact, getPortuguesePhilosophy } from './portuguese.js'
import { getFrenchExample, getFrenchFact, getFrenchPhilosophy } from './french.js'

/** @type {Record<string, (term: string) => string>} */
const FACT_PROVIDERS = {
  russian: getRussianFact,
  italian: getItalianFact,
  portuguese: getPortugueseFact,
  french: getFrenchFact,
}

/** @type {Record<string, (term: string) => {sentence: string, translation: string} | null>} */
const EXAMPLE_PROVIDERS = {
  russian: getRussianExample,
  italian: getItalianExample,
  portuguese: getPortugueseExample,
  french: getFrenchExample,
}

/** @type {Record<string, (term: string) => string>} */
const PHILOSOPHY_PROVIDERS = {
  russian: getRussianPhilosophy,
  italian: getItalianPhilosophy,
  portuguese: getPortuguesePhilosophy,
  french: getFrenchPhilosophy,
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

/**
 * @param {string} themeId
 * @param {string} term
 * @returns {{sentence: string, translation: string} | null} an example sentence, or null if none exists
 */
export function getExample(themeId, term) {
  const provider = EXAMPLE_PROVIDERS[themeId]
  return provider ? provider(term) : null
}

/**
 * @param {string} themeId
 * @param {string} term
 * @returns {string} a one-line philosophical cross-reference, or '' if none exists
 */
export function getPhilosophy(themeId, term) {
  const provider = PHILOSOPHY_PROVIDERS[themeId]
  return provider ? provider(term) : ''
}
