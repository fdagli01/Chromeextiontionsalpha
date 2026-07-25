import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { _resetConnectionForTests } from '../db/connection.js'
import { getWordsByTheme } from '../db/wordsRepo.js'
import { seedSampleWords } from '../db/seedWords.js'
import App from './App.jsx'

/**
 * Component-level coverage for the popup shell: the first-launch onboarding
 * overlay and the level-gated tab locking. Everything else here (FSRS
 * scheduling, XP math, etc.) already has dedicated unit tests — this file
 * exists to catch the class of bug those can't: a locked tab that's
 * actually clickable, an overlay that never dismisses, etc.
 */

// Onboarding/weekly-report flags live in chrome.storage.sync (per-account,
// not per-device); pendingCrisis and friends stay in .local. Tests share one
// backing object across both namespaces since nothing here writes the same
// key to both.
function mockChromeStorage(initial = {}) {
  const store = { ...initial }
  const namespace = () => ({
    get: vi.fn((key) => Promise.resolve(typeof key === 'string' ? { [key]: store[key] } : { ...store })),
    set: vi.fn((values) => {
      Object.assign(store, values)
      return Promise.resolve()
    }),
    remove: vi.fn(() => Promise.resolve()),
  })
  global.chrome = {
    storage: {
      local: namespace(),
      sync: namespace(),
    },
    windows: { create: vi.fn() },
    runtime: { getURL: vi.fn((path) => path) },
  }
  return store
}

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('first run', () => {
  it('opens on the era picker and seeds the chosen era, so the desk is never empty', async () => {
    const store = mockChromeStorage()
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('dialog', { name: /choose your era/i })).toBeInTheDocument()

    const romanCard = screen.getByRole('button', { name: /Rise of Rome/i })
    await user.click(romanCard)

    // The picker closes, the choice is remembered, and — the whole point —
    // the archive it seeded is not empty, so review opens on a real card.
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /choose your era/i })).not.toBeInTheDocument())
    expect(store.onboardingSeenV2).toBe(true)
    expect((await getWordsByTheme('italian')).length).toBeGreaterThan(0)
  })

  it('stays hidden once the player has begun', async () => {
    mockChromeStorage({ onboardingSeenV2: true })
    render(<App />)

    // Let the popup finish its initial theme/progress loads before asserting
    // an absence — otherwise this would trivially pass before render settles.
    await waitFor(() => expect(screen.getByText('INTERROGATE')).toBeInTheDocument())
    expect(screen.queryByRole('dialog', { name: /choose your era/i })).not.toBeInTheDocument()
  })

  it('does not send an existing player back to the picker after the upgrade', async () => {
    // No v2 flag (they onboarded under v1), but they already have an archive.
    mockChromeStorage()
    await seedSampleWords('russian')
    render(<App />)

    await waitFor(() => expect(screen.getByText('INTERROGATE')).toBeInTheDocument())
    expect(screen.queryByRole('dialog', { name: /choose your era/i })).not.toBeInTheDocument()
  })
})

describe('progressive tab locking', () => {
  it('renders FACTIONS locked at level 1 and ignores clicks on it', async () => {
    mockChromeStorage({ onboardingSeenV1: true })
    const user = userEvent.setup()
    render(<App />)

    // Tabs are role="tab" (see the tablist in App.jsx); a locked tab is
    // named for what it needs rather than its glyph.
    const reviewTab = await screen.findByRole('tab', { name: /INTERROGATE/ })
    expect(reviewTab).toHaveAttribute('aria-selected', 'true')

    const lockedTab = screen.getByRole('tab', { name: /locked until level 3/i })
    expect(lockedTab).toBeDisabled()

    await user.click(lockedTab)

    // Clicking the locked tab must not switch the active tab away from review.
    expect(reviewTab).toHaveAttribute('aria-selected', 'true')
  })
})
