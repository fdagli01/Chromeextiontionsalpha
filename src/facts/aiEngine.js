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

const API_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

function parseChronicleJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!parsed.sentence || !parsed.translation || !parsed.chronicle_insight) return null
  return parsed
}

/**
 * Generates an immersive example sentence + Turkish-context historical
 * insight for a word using the Anthropic API, in the voice of the word's
 * thematic "Mainframe". Requires the user's own API key (settings). Returns
 * null on any failure so callers can fall back to curated content.
 * @param {string} themeId
 * @param {string} term
 * @param {string} apiKey
 * @param {string} [model]
 * @returns {Promise<{sentence: string, translation: string, chronicle_insight: string} | null>}
 */
export async function generateChronicleEntry(themeId, term, apiKey, model = DEFAULT_MODEL) {
  const mainframe = MAINFRAMES[themeId]
  if (!mainframe || !apiKey) return null

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        system: CHRONICLE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Word: "${term}"\nMainframe: ${mainframe}` }],
      }),
    })
    if (!response.ok) return null

    const data = await response.json()
    const raw = data?.content?.[0]?.text
    if (!raw) return null

    return parseChronicleJson(raw)
  } catch (error) {
    console.warn('Polyglot Chronicle: AI chronicle generation failed', error)
    return null
  }
}
