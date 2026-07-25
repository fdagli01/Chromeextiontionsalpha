import { describe, expect, it } from 'vitest'
import { TERMINAL_TIERS, terminalTierForLevel, terminalTierForProgress } from './terminalTier.js'

describe('terminalTierForLevel', () => {
  it('is rookie below the Promoted badge threshold', () => {
    expect(terminalTierForLevel(1)).toBe(0)
    expect(terminalTierForLevel(4)).toBe(0)
  })

  it('is baseline between Promoted and General Secretary', () => {
    expect(terminalTierForLevel(5)).toBe(1)
    expect(terminalTierForLevel(9)).toBe(1)
  })

  it('is veteran at and above the General Secretary threshold', () => {
    expect(terminalTierForLevel(10)).toBe(2)
    expect(terminalTierForLevel(25)).toBe(2)
  })
})

describe('terminalTierForProgress', () => {
  const finished = [{ id: 'ending', choiceId: 'russian:archivist' }]

  it('follows level while the era is still open', () => {
    expect(terminalTierForProgress({ level: 1, decisions: [] })).toBe(TERMINAL_TIERS.ROOKIE)
    expect(terminalTierForProgress({ level: 6, decisions: [] })).toBe(TERMINAL_TIERS.STANDARD)
    expect(terminalTierForProgress({ level: 12, decisions: [] })).toBe(TERMINAL_TIERS.VETERAN)
  })

  it('commissions the terminal once the era\'s file is closed', () => {
    expect(terminalTierForProgress({ level: 12, decisions: finished })).toBe(TERMINAL_TIERS.COMMISSIONED)
  })

  it('is not something levelling alone can reach', () => {
    expect(terminalTierForLevel(999)).toBe(TERMINAL_TIERS.VETERAN)
    expect(terminalTierForProgress({ level: 999, decisions: [] })).toBe(TERMINAL_TIERS.VETERAN)
  })

  it('ignores other journal entries, and survives a progress record without one', () => {
    expect(terminalTierForProgress({ level: 12, decisions: [{ id: 'french-bribe' }] })).toBe(TERMINAL_TIERS.VETERAN)
    expect(terminalTierForProgress({ level: 12 })).toBe(TERMINAL_TIERS.VETERAN)
    expect(terminalTierForProgress(null)).toBe(TERMINAL_TIERS.ROOKIE)
  })
})
