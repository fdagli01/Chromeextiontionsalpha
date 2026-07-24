import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The service worker is where words actually enter the archive: a
 * right-click capture is the user's very first interaction with the
 * extension, and until now none of it was covered.
 *
 * The module registers chrome listeners at import time, so the mock must
 * exist before the dynamic import below.
 */
const notifications = []
const badgeCalls = []
const storageLocal = {}

global.chrome = {
  runtime: { onInstalled: { addListener: vi.fn() }, onStartup: { addListener: vi.fn() }, onMessage: { addListener: vi.fn() } },
  contextMenus: { removeAll: vi.fn((cb) => cb?.()), create: vi.fn(), onClicked: { addListener: vi.fn() } },
  alarms: { onAlarm: { addListener: vi.fn() }, create: vi.fn(), clear: vi.fn() },
  notifications: { create: vi.fn((opts) => notifications.push(opts)) },
  action: {
    setBadgeText: vi.fn((o) => { badgeCalls.push(o); return Promise.resolve() }),
    setBadgeBackgroundColor: vi.fn(() => Promise.resolve()),
    setBadgeTextColor: vi.fn(() => Promise.resolve()),
  },
  storage: {
    local: {
      get: vi.fn((key) => Promise.resolve(typeof key === 'string' ? { [key]: storageLocal[key] } : { ...storageLocal })),
      set: vi.fn((v) => { Object.assign(storageLocal, v); return Promise.resolve() }),
    },
    sync: { get: vi.fn(() => Promise.resolve({})), set: vi.fn(() => Promise.resolve()) },
  },
}

const { captureWord, checkBounty, collectDueTerms, menuIdForTheme, updateDueBadge } = await import('./index.js')
const { _resetConnectionForTests } = await import('../db/connection.js')
const { getWordsByTheme, getDueWords } = await import('../db/wordsRepo.js')
const { setSetting } = await import('../db/settingsRepo.js')
const { listThemes } = await import('../themes/index.js')

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
  notifications.length = 0
  badgeCalls.length = 0
  for (const k of Object.keys(storageLocal)) delete storageLocal[k]
  // Default: translation succeeds. Individual tests override.
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ responseData: { translatedText: 'comrade' } }) })
  )
})

describe('menuIdForTheme', () => {
  it('produces a distinct, round-trippable id for every theme', () => {
    const ids = listThemes().map((t) => menuIdForTheme(t.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const theme of listThemes()) {
      expect(listThemes().find((t) => menuIdForTheme(t.id) === menuIdForTheme(theme.id)).id).toBe(theme.id)
    }
  })
})

describe('captureWord', () => {
  it('files the word with its translation and curated content attached', async () => {
    await captureWord('товарищ', 'russian', 'https://example.com')
    const words = await getWordsByTheme('russian')
    expect(words).toHaveLength(1)
    expect(words[0].term).toBe('товарищ')
    expect(words[0].translation).toBe('comrade')
    // товарищ is a curated term, so trivia attaches without any AI call.
    expect(words[0].fact).toBeTruthy()
    expect(words[0].transliteration).toBeTruthy()
  })

  it('still files the word when the translation lookup fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('offline')))
    await captureWord('спутник', 'russian', 'https://example.com')
    const words = await getWordsByTheme('russian')
    expect(words).toHaveLength(1)
    expect(words[0].term).toBe('спутник')
  })

  it('confirms the capture with a themed notification', async () => {
    await captureWord('товарищ', 'russian', 'https://example.com')
    expect(notifications).toHaveLength(1)
    expect(notifications[0].title).toContain('Filed')
    expect(notifications[0].message).toContain('товарищ')
  })

  it('leaves the word immediately due, and refreshes the toolbar badge', async () => {
    await captureWord('товарищ', 'russian', 'https://example.com')
    expect(await getDueWords('russian')).toHaveLength(1)
    expect(badgeCalls.at(-1).text).toBe('1')
  })

  it('ignores an unknown theme instead of throwing', async () => {
    await expect(captureWord('x', 'klingon', 'https://example.com')).resolves.not.toThrow()
  })
})

describe('bounty anti-farming', () => {
  it('does not let a re-captured word advance the daily bounty twice', async () => {
    const spy = vi.spyOn(await import('../progression/bounties.js'), 'recordBountyCapture')
    await captureWord('товарищ', 'russian', 'https://example.com')
    const afterFirst = spy.mock.calls.length
    // Same term again (different page) — already archived, so it must not count.
    await captureWord('товарищ', 'russian', 'https://other.example')
    expect(spy.mock.calls.length).toBe(afterFirst)
    spy.mockRestore()
  })

  it('awards nothing when the capture does not complete the bounty', async () => {
    await checkBounty('товарищ', 'russian', 'https://example.com')
    expect(notifications.filter((n) => n.title.includes('Critical intel'))).toHaveLength(0)
  })
})

describe('collectDueTerms', () => {
  it('returns nothing at all when page highlighting is switched off', async () => {
    await setSetting('domHighlightEnabled', false)
    expect(await collectDueTerms()).toEqual({ enabled: false, terms: [] })
  })

  it('returns due terms with a theme colour once enabled', async () => {
    await setSetting('domHighlightEnabled', true)
    await captureWord('товарищ', 'russian', 'https://example.com')
    const { enabled, terms } = await collectDueTerms()
    expect(enabled).toBe(true)
    expect(terms.some((t) => t.term === 'товарищ' && t.color)).toBe(true)
  })
})

describe('updateDueBadge', () => {
  it('clears the badge when nothing is due', async () => {
    await updateDueBadge()
    expect(badgeCalls.at(-1).text).toBe('')
  })

  it('never throws even if the badge API is unavailable', async () => {
    const saved = global.chrome.action.setBadgeText
    global.chrome.action.setBadgeText = vi.fn(() => Promise.reject(new Error('no action API')))
    await expect(updateDueBadge()).resolves.not.toThrow()
    global.chrome.action.setBadgeText = saved
  })
})
