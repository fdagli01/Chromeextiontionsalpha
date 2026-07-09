import { transliterateRussian } from './russian.js'

/** @type {Record<string, (term: string) => string>} */
const TRANSLITERATION_PROVIDERS = {
  russian: transliterateRussian,
}

/**
 * @param {string} themeId
 * @param {string} term
 * @returns {string} a Latin pronunciation hint, or '' if the theme has none
 */
export function getTransliteration(themeId, term) {
  const provider = TRANSLITERATION_PROVIDERS[themeId]
  return provider ? provider(term) : ''
}
