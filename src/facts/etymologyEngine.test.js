import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateEtymologyEntry } from './etymologyEngine.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const VALID_JSON = JSON.stringify({
  origin: 'From Latin disciplina, "instruction, training".',
  rootLanguage: 'Latin',
  evolution: 'Narrowed over time from general "teaching" to specifically military/moral order.',
  thematicTie: 'Roman military virtue prized disciplina as the trait that separated legion from mob.',
})

function geminiResponse(text) {
  return { candidates: [{ content: { parts: [{ text }] } }] }
}

describe('generateEtymologyEntry', () => {
  it('returns the parsed entry on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geminiResponse(VALID_JSON),
    })

    const result = await generateEtymologyEntry('italian', 'disciplina', 'gemini-test-key')
    expect(result).toEqual(JSON.parse(VALID_JSON))
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/'),
      expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ 'x-goog-api-key': 'gemini-test-key' }) })
    )
    expect(fetch.mock.calls[0][0]).not.toContain('gemini-test-key')
  })

  it('strips markdown code fences before parsing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geminiResponse('```json\n' + VALID_JSON + '\n```'),
    })

    const result = await generateEtymologyEntry('russian', 'товарищ', 'gemini-test-key')
    expect(result).toEqual(JSON.parse(VALID_JSON))
  })

  it('returns null when no api key is provided', async () => {
    global.fetch = vi.fn()
    expect(await generateEtymologyEntry('italian', 'disciplina', '')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null for an unknown theme', async () => {
    global.fetch = vi.fn()
    expect(await generateEtymologyEntry('klingon', 'qoH', 'gemini-test-key')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await generateEtymologyEntry('french', 'liberté', 'gemini-test-key')).toBeNull()
  })

  it('returns null when the response is missing required fields', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => geminiResponse(JSON.stringify({ origin: 'incomplete' })),
    })
    expect(await generateEtymologyEntry('portuguese', 'nau', 'gemini-test-key')).toBeNull()
  })

  it('returns null when the request throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    expect(await generateEtymologyEntry('italian', 'disciplina', 'gemini-test-key')).toBeNull()
  })
})
