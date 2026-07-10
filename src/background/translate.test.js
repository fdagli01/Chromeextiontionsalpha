import { afterEach, describe, expect, it, vi } from 'vitest'
import { translateToEnglish } from './translate.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('translateToEnglish', () => {
  it('returns the translated text on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responseData: { translatedText: 'comrade' } }),
    })

    const result = await translateToEnglish('товарищ', 'ru')
    expect(result).toBe('comrade')
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('langpair=ru|en'))
  })

  it('returns an empty string when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await translateToEnglish('да', 'ru')).toBe('')
  })

  it('returns an empty string when the request throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    expect(await translateToEnglish('нет', 'ru')).toBe('')
  })
})
