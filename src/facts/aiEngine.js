import { requestGemini } from './geminiClient.js'

const CHRONICLE_SYSTEM_PROMPT = `You are the "Polyglot Chronicle" AI Engine—an elite historical archiver, etymologist, and philosopher. Your task is to contextualize foreign vocabulary words based on specific historical and philosophical epochs ("Mainframes").

For each word and mainframe provided, generate an immersive historical sentence, its English translation, and a fascinating philosophical or historical insight.

CRITICAL INSTRUCTIONS:
1. Tone & Style: Strictly match the atmospheric aesthetic of the requested Mainframe (e.g., disciplined Roman, radical French revolutionary, seafaring Portuguese, or clandestine Soviet).
2. Accuracy: Ensure the historical context, philosophical terms, and English translations are impeccable and natural.
3. Strict JSON Format: You must output ONLY a raw JSON object. Do not include markdown code blocks (like \`\`\`json), no conversational filler, and no text before or after the JSON.

JSON Structure:
{
  "sentence": "[An immersive, advanced example sentence in the source language using the target word, perfectly tailored to the epoch's theme]",
  "translation": "[Natural, accurate English translation of the sentence]",
  "chronicle_insight": "[A 1-2 sentence profound historical fact or philosophical commentary explaining how the concept or word ties into the mentality, struggles, or ideas of that specific era]"
}`

const MAINFRAMES = {
  italian: 'Castra Aeterna (Rome) — a disciplined, martial, classical Roman epoch',
  french: 'La Terreur (French Revolution) — a radical, revolutionary 18th-century French epoch',
  portuguese: 'Casa da Índia (Portuguese Discovery) — a seafaring, 16th-century Age of Discovery epoch',
  russian: 'K.G.B. Terminal (Soviet Era) — a clandestine, high-stakes Cold War Soviet epoch',
}

const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

function parseChronicleJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!parsed.sentence || !parsed.translation || !parsed.chronicle_insight) return null
  return parsed
}

/**
 * Generates an immersive example sentence + historical insight for a word
 * using Google's Gemini API, in the voice of the word's thematic
 * "Mainframe". Requires the user's own API key (settings). Returns null on
 * any failure so callers can fall back to curated content.
 * @param {string} themeId
 * @param {string} term
 * @param {string} apiKey
 * @param {string} [model] - a Gemini model name, e.g. "gemini-2.5-flash-lite"
 * @returns {Promise<{sentence: string, translation: string, chronicle_insight: string} | null>}
 */
export async function generateChronicleEntry(themeId, term, apiKey, model = DEFAULT_MODEL) {
  const mainframe = MAINFRAMES[themeId]
  if (!mainframe || !apiKey) return null

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const data = await requestGemini(endpoint, apiKey, JSON.stringify({
    systemInstruction: { parts: [{ text: CHRONICLE_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: `Word: "${term}"\nMainframe: ${mainframe}` }] }],
    generationConfig: { responseMimeType: 'application/json' },
  }))
  if (!data) return null

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) return null

  try {
    return parseChronicleJson(raw)
  } catch (error) {
    console.warn('Polyglot Chronicle: AI chronicle generation failed', error)
    return null
  }
}
