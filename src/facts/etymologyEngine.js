const ETYMOLOGY_SYSTEM_PROMPT = `You are the "Etymological Detective"—a rigorous historical linguist embedded in the "Polyglot Chronicle" archive. Your task is to trace the origin of a foreign vocabulary word and tie it to a specific historical/philosophical epoch ("Mainframe").

CRITICAL INSTRUCTIONS:
1. Accuracy: Root language and etymological claims must be linguistically defensible — prefer "likely" phrasing over invented certainty if the etymology is disputed.
2. Thematic tie: Connect the word's history to the mentality, politics, or struggles of the requested Mainframe specifically, not language history in general.
3. Strict JSON Format: You must output ONLY a raw JSON object. Do not include markdown code blocks (like \`\`\`json), no conversational filler, and no text before or after the JSON.

JSON Structure:
{
  "origin": "[A concise statement of the word's root and original meaning]",
  "rootLanguage": "[e.g. 'Proto-Slavic', 'Latin', 'Old French']",
  "evolution": "[1-2 sentences on how the meaning shifted across centuries into its modern sense]",
  "thematicTie": "[1-2 sentences tying the etymology specifically to the requested Mainframe's history or philosophy]"
}`

const MAINFRAMES = {
  italian: 'Castra Aeterna (Rome) — a disciplined, martial, classical Roman epoch',
  french: 'La Terreur (French Revolution) — a radical, revolutionary 18th-century French epoch',
  portuguese: 'Casa da Índia (Portuguese Discovery) — a seafaring, 16th-century Age of Discovery epoch',
  russian: 'K.G.B. Terminal (Soviet Era) — a clandestine, high-stakes Cold War Soviet epoch',
}

const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

function parseEtymologyJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!parsed.origin || !parsed.rootLanguage || !parsed.evolution || !parsed.thematicTie) return null
  return parsed
}

/**
 * Generates an etymological/historical-linguistics breakdown for a word
 * using Google's Gemini API, tied to the word's thematic "Mainframe".
 * Requires the user's own API key (settings). Returns null on any failure
 * so callers can simply leave the word without an etymology entry.
 * @param {string} themeId
 * @param {string} term
 * @param {string} apiKey
 * @param {string} [model] - a Gemini model name, e.g. "gemini-2.5-flash-lite"
 * @returns {Promise<{origin: string, rootLanguage: string, evolution: string, thematicTie: string} | null>}
 */
export async function generateEtymologyEntry(themeId, term, apiKey, model = DEFAULT_MODEL) {
  const mainframe = MAINFRAMES[themeId]
  if (!mainframe || !apiKey) return null

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: ETYMOLOGY_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: `Word: "${term}"\nMainframe: ${mainframe}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })
    if (!response.ok) return null

    const data = await response.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) return null

    return parseEtymologyJson(raw)
  } catch (error) {
    console.warn('Polyglot Chronicle: Etymological Detective generation failed', error)
    return null
  }
}
