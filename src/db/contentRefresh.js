import { getAllWords, updateWord } from './wordsRepo.js'
import { getSetting } from './settingsRepo.js'
import { getExample, getFact, getPhilosophy } from '../facts/index.js'
import { generateChronicleEntry } from '../facts/aiEngine.js'
import { generateEtymologyEntry } from '../facts/etymologyEngine.js'
import { getTransliteration } from '../transliteration/index.js'

// Gemini free-tier is rate-limited per minute; pacing AI calls one word at a
// time (rather than bursting through the whole backlog) keeps a bulk backfill
// under quota instead of tripping 429s.
const AI_CALL_SPACING_MS = 4500

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Backfills fact/example/philosophy/transliteration/etymology onto words
 * captured before those fields existed (or before a term was added to the
 * curated pool). Only fills in currently-empty fields — never overwrites
 * content the user might have already seen, and is safe to run repeatedly.
 *
 * For words with no curated fact/example, falls back to the AI Chronicle
 * Engine, and separately to the Etymological Detective for the etymology
 * field, when the user has enabled the AI engine and supplied an API key.
 * @returns {Promise<{total: number, updated: number}>}
 */
export async function refreshCuratedContent() {
  const words = await getAllWords()
  const aiEnabled = await getSetting('aiEngineEnabled', false)
  const apiKey = aiEnabled ? await getSetting('aiEngineApiKey', '') : ''
  const model = await getSetting('aiEngineModel', undefined)
  let updated = 0

  for (const [index, word] of words.entries()) {
    const patch = {}
    let calledAi = false

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
      calledAi = true
      if (entry) {
        if (stillMissingFact) patch.fact = entry.chronicle_insight
        if (stillMissingExample) {
          patch.exampleSentence = entry.sentence
          patch.exampleTranslation = entry.translation
        }
      }
    }

    if (apiKey && !word.etymology) {
      const etymology = await generateEtymologyEntry(word.themeId, word.term, apiKey, model)
      calledAi = true
      if (etymology) patch.etymology = etymology
    }

    // Pace bulk backfills so we don't burst past the Gemini free-tier's
    // per-minute quota; only wait when we actually hit the API and there's
    // more work left to do.
    if (calledAi && index < words.length - 1) {
      await sleep(AI_CALL_SPACING_MS)
    }

    if (Object.keys(patch).length > 0) {
      await updateWord(word.id, patch)
      updated++
    }
  }

  return { total: words.length, updated }
}
