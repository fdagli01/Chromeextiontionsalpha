import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { _resetConnectionForTests } from '../db/connection.js'
import App from './App.jsx'

/**
 * Component-level coverage for the popup shell: the first-launch onboarding
 * overlay and the level-gated tab locking. Everything else here (FSRS
 * scheduling, XP math, etc.) already has dedicated unit tests — this file
 * exists to catch the class of bug those can't: a locked tab that's
 * actually clickable, an overlay that never dismisses, etc.
 */

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
        remove: vi.fn(() => Promise.resolve()),
      },
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

describe('onboarding overlay', () => {
  it('shows on first launch and persists dismissal', async () => {
    const store = mockChromeStorage()
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('WELCOME — HOW THIS WORKS')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /GOT IT/ }))

    expect(screen.queryByText('WELCOME — HOW THIS WORKS')).not.toBeInTheDocument()
    expect(store.onboardingSeenV1).toBe(true)
  })

  it('stays hidden once the user has already seen it', async () => {
    mockChromeStorage({ onboardingSeenV1: true })
    render(<App />)

    // Let the popup finish its initial theme/progress loads before asserting
    // an absence — otherwise this would trivially pass before render settles.
    await waitFor(() => expect(screen.getByText('INTERROGATE')).toBeInTheDocument())
    expect(screen.queryByText('WELCOME — HOW THIS WORKS')).not.toBeInTheDocument()
  })
})

describe('progressive tab locking', () => {
  it('renders FACTIONS locked at level 1 and ignores clicks on it', async () => {
    mockChromeStorage({ onboardingSeenV1: true })
    const user = userEvent.setup()
    render(<App />)

    const reviewTab = await screen.findByRole('button', { name: /INTERROGATE/ })
    expect(reviewTab.className).toContain('active')

    const lockedTab = screen.getByRole('button', { name: /LVL 3/ })
    expect(lockedTab).toBeDisabled()

    await user.click(lockedTab)

    // Clicking the locked tab must not switch the active tab away from review.
    expect(reviewTab.className).toContain('active')
  })
})
