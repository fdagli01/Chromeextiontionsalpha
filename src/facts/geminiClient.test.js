import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { requestGemini } from './geminiClient.js'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function rateLimited(retryDelay) {
  return {
    ok: false,
    status: 429,
    json: async () => ({ error: { details: retryDelay ? [{ retryDelay }] : [] } }),
  }
}

describe('requestGemini', () => {
  it('retries on 429 using the server-suggested retryDelay, then succeeds', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(rateLimited('2s'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })

    const promise = requestGemini('https://example.com', 'test-key', '{}')
    await vi.advanceTimersByTimeAsync(2000)
    const result = await promise

    expect(result).toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to exponential backoff when no retryDelay is given', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(rateLimited())
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })

    const promise = requestGemini('https://example.com', 'test-key', '{}')
    await vi.advanceTimersByTimeAsync(2000)
    const result = await promise

    expect(result).toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('gives up after exhausting retries on repeated 429s', async () => {
    global.fetch = vi.fn().mockResolvedValue(rateLimited('1s'))

    const promise = requestGemini('https://example.com', 'test-key', '{}')
    await vi.advanceTimersByTimeAsync(10000)
    const result = await promise

    expect(result).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(4) // 1 initial + 3 retries
  })

  it('does not retry on a non-429 error status', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })

    const result = await requestGemini('https://example.com', 'test-key', '{}')

    expect(result).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns null immediately on a network error, without retrying', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))

    const result = await requestGemini('https://example.com', 'test-key', '{}')

    expect(result).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
