/**
 * Wiktionary enrichment: the automatic source of meaning, etymology and
 * example sentences for words nobody hand-curated.
 *
 * The curated fact files cover ~114 terms. Everything a player actually
 * captures off the open web falls outside that, and the honest assumption
 * is that no end user will ever type an example sentence or a piece of
 * trivia themselves — so if this is not automatic, the app's best feature
 * simply vanishes the moment someone uses it for real.
 *
 * Wiktionary is the right source here: keyless, no quota, no account, CC
 * licensed, and it covers exactly the two things this app already wants —
 * an etymology (which IS the "interesting fact" for a vocabulary app) and
 * a usage example. It also doubles as a translation fallback, since a
 * definition is a meaning even when the translation API is down.
 */

const REST_DEFINITION = 'https://en.wiktionary.org/api/rest_v1/page/definition'

/** Wiktionary section keys are language codes; these are the app's five. */
const LANGUAGE_KEYS = {
  ru: 'ru',
  it: 'it',
  fr: 'fr',
  pt: 'pt',
  es: 'es',
}

/**
 * Wiktionary returns definition and example text as HTML fragments. This
 * is not a general sanitizer — it strips tags and decodes the handful of
 * entities the API actually emits, then collapses whitespace. The result
 * is only ever rendered as text by React, never as markup.
 * @param {string} html
 * @returns {string}
 */
export function stripMarkup(html) {
  if (typeof html !== 'string') return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Picks the most useful entry out of a Wiktionary definition payload:
 * the first sense that actually has text, preferring one that also
 * carries an example sentence, since an example is worth more to a
 * learner than a bare gloss.
 * @param {Record<string, Array<Object>>} payload
 * @param {string} languageCode
 * @returns {{definition: string, partOfSpeech: string, example: string, exampleTranslation: string} | null}
 */
export function pickEntry(payload, languageCode) {
  const key = LANGUAGE_KEYS[languageCode]
  const sections = (key && payload?.[key]) || []
  let fallback = null

  for (const section of sections) {
    for (const sense of section.definitions ?? []) {
      const definition = stripMarkup(sense.definition)
      if (!definition) continue

      const parsed = sense.parsedExamples?.[0]
      const example = stripMarkup(parsed?.example ?? sense.examples?.[0] ?? '')
      const entry = {
        definition,
        partOfSpeech: section.partOfSpeech ?? '',
        example,
        exampleTranslation: stripMarkup(parsed?.translation ?? ''),
      }
      // A sense with a usage example wins outright; otherwise remember the
      // first readable one and keep looking for a better sense.
      if (example) return entry
      fallback = fallback ?? entry
    }
  }
  return fallback
}

/**
 * Shapes a Wiktionary entry into the fields a word record uses. The
 * "fact" is phrased as archive intel so it sits naturally beside the
 * hand-written curated notes rather than reading like a scraped
 * dictionary dump.
 * @param {{definition: string, partOfSpeech: string, example: string, exampleTranslation: string}} entry
 * @returns {{fact: string, exampleSentence: string, exampleTranslation: string, definition: string}}
 */
export function toWordFields(entry) {
  const pos = entry.partOfSpeech ? `${entry.partOfSpeech.toLowerCase()} · ` : ''
  return {
    fact: `${pos}${entry.definition}`,
    exampleSentence: entry.example,
    exampleTranslation: entry.exampleTranslation,
    definition: entry.definition,
  }
}

/**
 * Looks a term up on Wiktionary. Resolves to null on anything unexpected
 * — a miss, a rate limit, an outage, a shape change — because enrichment
 * is a bonus layered onto an already-saved word and must never be able to
 * break a capture.
 * @param {string} term
 * @param {string} languageCode - BCP-47, e.g. "es"
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{fact: string, exampleSentence: string, exampleTranslation: string, definition: string} | null>}
 */
export async function lookupWiktionary(term, languageCode, fetchImpl = fetch) {
  const cleaned = term?.trim()
  if (!cleaned || !LANGUAGE_KEYS[languageCode]) return null
  // The REST endpoint keys on the page title; multi-word phrases use
  // underscores, and everything needs encoding for non-Latin scripts.
  const title = encodeURIComponent(cleaned.toLowerCase().replace(/\s+/g, '_'))

  try {
    const response = await fetchImpl(`${REST_DEFINITION}/${title}`, {
      headers: {
        // Wikimedia asks clients to identify themselves; anonymous
        // requests are rate-limited harder or refused outright.
        'Api-User-Agent': 'PolyglotChronicle/1.0 (Chrome extension; vocabulary learning)',
      },
    })
    if (!response.ok) return null

    const entry = pickEntry(await response.json(), languageCode)
    return entry ? toWordFields(entry) : null
  } catch {
    // Offline, blocked, or malformed — the word keeps whatever it had.
    return null
  }
}
