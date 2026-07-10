const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get'

/**
 * Looks up an English translation for a term using MyMemory's free,
 * keyless translation API. Returns '' on any failure so word capture can
 * still succeed with an empty translation the user can fill in later.
 * @param {string} term
 * @param {string} sourceLanguageCode - BCP-47 code, e.g. "ru"
 * @returns {Promise<string>}
 */
export async function translateToEnglish(term, sourceLanguageCode) {
  const langpair = `${sourceLanguageCode}|en`
  const url = `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(term)}&langpair=${langpair}`

  try {
    const response = await fetch(url)
    if (!response.ok) return ''

    const data = await response.json()
    return data?.responseData?.translatedText ?? ''
  } catch (error) {
    console.warn('Polyglot Chronicle: translation lookup failed', error)
    return ''
  }
}
