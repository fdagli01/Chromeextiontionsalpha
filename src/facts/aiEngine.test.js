import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateChronicleEntry } from './aiEngine.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const VALID_JSON = JSON.stringify({
  sentence: 'Miles disciplinam servat.',
  translation: 'The soldier keeps discipline.',
  chronicle_insight: 'Roman military virtue prized order above individual glory.',
})

function geminiResponse(text) {
  return { candidates: [{ content: { parts: [{ text }] } }] }
}

describe('generateChronicleEntry', () => {
  it('returns the parsed entry on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geminiResponse(VALID_JSON),
    })

    const result = await generateChronicleEntry('italian', 'disciplina', 'gemini-test-key')
    expect(result).toEqual(JSON.parse(VALID_JSON))
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=gemini-test-key'),
      expect.anything()
    )
  })

  it('strips markdown code fences before parsing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geminiResponse('```json\n' + VALID_JSON + '\n```'),
    })

    const result = await generateChronicleEntry('russian', 'товарищ', 'gemini-test-key')
    expect(result).toEqual(JSON.parse(VALID_JSON))
  })

  it('returns null when no api key is provided', async () => {
    global.fetch = vi.fn()
    expect(await generateChronicleEntry('italian', 'disciplina', '')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null for an unknown theme', async () => {
    global.fetch = vi.fn()
    expect(await generateChronicleEntry('klingon', 'qoH', 'gemini-test-key')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await generateChronicleEntry('french', 'liberté', 'gemini-test-key')).toBeNull()
  })

  it('returns null when the response is malformed JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geminiResponse('not json at all'),
    })
    expect(await generateChronicleEntry('portuguese', 'nau', 'gemini-test-key')).toBeNull()
  })

  it('returns null when the request throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    expect(await generateChronicleEntry('italian', 'disciplina', 'gemini-test-key')).toBeNull()
  })
})
