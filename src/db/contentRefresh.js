import { getAllWords, updateWord } from './wordsRepo.js'
import { getSetting } from './settingsRepo.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { generateChronicleEntry } from '../facts/aiEngine.js'
import { getTransliteration } from '../transliteration/index.js'

/**
 * Backfills fact/example/philosophy/transliteration onto words captured
 * before those fields existed (or before a term was added to the curated
 * pool). Only fills in currently-empty fields — never overwrites content
 * the user might have already seen, and is safe to run repeatedly.
 *
 * For words with no curated fact/example, falls back to the AI Chronicle
 * Engine when the user has enabled it and supplied an API key.
 * @returns {Promise<{total: number, updated: number}>}
 */
export async function refreshCuratedContent() {
  const words = await getAllWords()
  const aiEnabled = await getSetting('aiEngineEnabled', false)
  const apiKey = aiEnabled ? await getSetting('aiEngineApiKey', '') : ''
  const model = await getSetting('aiEngineModel', undefined)
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

    const stillMissingFact = !word.fact && !patch.fact
    const stillMissingExample = !word.exampleSentence && !patch.exampleSentence
    if (apiKey && (stillMissingFact || stillMissingExample)) {
      const entry = await generateChronicleEntry(word.themeId, word.term, apiKey, model)
      if (entry) {
        if (stillMissingFact) patch.fact = entry.chronicle_insight
        if (stillMissingExample) {
          patch.exampleSentence = entry.sentence
          patch.exampleTranslation = entry.translation
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      await updateWord(word.id, patch)
      updated++
    }
  }

  return { total: words.length, updated }
}
