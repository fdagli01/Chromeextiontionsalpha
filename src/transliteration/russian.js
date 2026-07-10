/**
 * Practical Cyrillic-to-Latin letter map for a language-learning aid (not a
 * scholarly transliteration standard). Soft/hard signs render as an
 * apostrophe / are dropped, matching the "[ radost' ]" style pronunciation
 * hints learners expect.
 * @type {Record<string, string>}
 */
const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: "'", э: 'e', ю: 'yu', я: 'ya',
}

/**
 * Transliterates a Cyrillic term into a Latin pronunciation hint,
 * character by character. Non-Cyrillic characters pass through unchanged,
 * so mixed-script input degrades gracefully instead of erroring.
 * @param {string} term
 * @returns {string}
 */
export function transliterateRussian(term) {
  return Array.from(term)
    .map((char) => {
      const lower = char.toLowerCase()
      const mapped = CYRILLIC_TO_LATIN[lower]
      if (mapped === undefined) return char
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
    })
    .join('')
}
