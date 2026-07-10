import { getAllWords, updateWord } from './wordsRepo.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { getTransliteration } from '../transliteration/index.js'

/**
 * Backfills fact/example/philosophy/transliteration onto words captured
 * before those fields existed (or before a term was added to the curated
 * pool). Only fills in currently-empty fields — never overwrites content
 * the user might have already seen, and is safe to run repeatedly.
 * @returns {Promise<{total: number, updated: number}>}
 */
export async function refreshCuratedContent() {
  const words = await getAllWords()
  let updated = 0

  for (const word of words) {
    const patch = {}

    if (!word.fact) {
      const fact = getFact(word.themeId, word.term)
      if (fact) patch.fact = fact
    }

    if (!word.exampleSentence) {
      const example = getExample(word.themeId, word.term)
      if (example) {
        patch.exampleSentence = example.sentence
        patch.exampleTranslation = example.translation
      }
    }

    if (!word.philosophyNote) {
      const philosophy = getPhilosophy(word.themeId, word.term)
      if (philosophy) patch.philosophyNote = philosophy
    }

    if (!word.transliteration) {
      const transliteration = getTransliteration(word.themeId, word.term)
      if (transliteration) patch.transliteration = transliteration
    }

    if (Object.keys(patch).length > 0) {
      await updateWord(word.id, patch)
      updated++
    }
  }

  return { total: words.length, updated }
}
