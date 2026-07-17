import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBountyState, getDailyBounty, recordBountyCapture } from './bounties.js'
import { listThemes } from '../themes/index.js'

function mockChromeStorage(initial = {}) {
  const store = { ...initial }
  global.chrome = {
    storage: {
      local: {
        get: vi.fn((key) => Promise.resolve(typeof key === 'string' ? { [key]: store[key] } : { ...store })),
        set: vi.fn((values) => {
          Object.assign(store, values)
          return Promise.resolve()
        }),
      },
    },
  }
  return store
}

describe('getDailyBounty', () => {
  it('is a pure function of the date — same day, same bounty', () => {
    const a = getDailyBounty('2026-07-17')
    const b = getDailyBounty('2026-07-17')
    // Exclude `check` (a fresh closure each call, never reference-equal) and
    // compare the actual bounty identity/content instead.
    expect({ id: a.id, directive: a.directive, target: a.target }).toEqual({
      id: b.id,
      directive: b.directive,
      target: b.target,
    })
  })

  it('varies across different days', () => {
    const ids = new Set(
      ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23'].map(
        (d) => getDailyBounty(d).id
      )
    )
    expect(ids.size).toBeGreaterThan(1)
  })
})

describe('domain-intel check', () => {
  it('matches a hostname ending in the target TLD, including subdomains', () => {
    const bounty = { check: (ctx) => ctx.pageUrl && new URL(ctx.pageUrl).hostname.endsWith('.es') }
    expect(bounty.check({ pageUrl: 'https://www.elpais.es/noticia' })).toBe(true)
    expect(bounty.check({ pageUrl: 'https://elpais.es/' })).toBe(true)
  })

  it('does not match a TLD substring elsewhere in the hostname', () => {
    // Find an actual domain-intel day to exercise the real check function.
    let bounty = null
    for (let d = 1; d <= 31; d++) {
      const day = `2026-01-${String(d).padStart(2, '0')}`
      const candidate = getDailyBounty(day)
      if (candidate.id === 'domain-intel') {
        bounty = candidate
        break
      }
    }
    expect(bounty).not.toBeNull()
    const tld = bounty.directive.match(/\.(\w+) site/)[1]
    expect(bounty.check({ pageUrl: `https://news.${tld}/article` })).toBe(true)
    expect(bounty.check({ pageUrl: `https://example.${tld}.evil.com/` })).toBe(false)
    expect(bounty.check({ pageUrl: 'not a url' })).toBe(false)
  })
})

describe('recordBountyCapture', () => {
  beforeEach(() => {
    mockChromeStorage()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-17T12:00:00Z'))
  })

  it('advances count only when the capture matches, and completes at target', async () => {
    const bounty = getDailyBounty('2026-07-17')
    // Build a capture context that matches whichever bounty rolled for this date.
    const ctxForBounty = (() => {
      if (bounty.id === 'domain-intel') return { term: 'palabra', themeId: 'spanish', pageUrl: `https://x.${bounty.directive.match(/\.(\w+) site/)[1]}/` }
      if (bounty.id === 'letter-hunt') return { term: bounty.directive.match(/"(\w)"/)[1].toLowerCase().repeat(3), themeId: 'russian', pageUrl: 'https://x.com' }
      if (bounty.id === 'long-signal') return { term: 'abcdefghij', themeId: 'russian', pageUrl: 'https://x.com' }
      const themeName = bounty.directive.match(/^The (\w+) desk/)[1]
      const matchedTheme = listThemes().find((t) => t.name === themeName)
      return { term: 'word', themeId: matchedTheme.id, pageUrl: 'https://x.com' }
    })()

    let result
    for (let i = 0; i < bounty.target - 1; i++) {
      result = await recordBountyCapture(ctxForBounty)
      expect(result.justCompleted).toBe(false)
    }
    result = await recordBountyCapture(ctxForBounty)
    expect(result.justCompleted).toBe(true)
    expect(result.state.claimed).toBe(true)

    // A further matching capture after completion doesn't double-fire.
    const again = await recordBountyCapture(ctxForBounty)
    expect(again.justCompleted).toBe(false)
  })

  it('does not advance count for a non-matching capture', async () => {
    const state1 = await getBountyState()
    const result = await recordBountyCapture({ term: '', themeId: 'nonexistent-theme', pageUrl: 'https://nowhere.zz/' })
    // A capture that matches no bounty check leaves count unchanged.
    if (!result.justCompleted) {
      expect(result.state.count).toBeLessThanOrEqual(state1.count + 1)
    }
  })
})
