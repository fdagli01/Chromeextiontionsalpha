import { describe, expect, it } from 'vitest'
import { terminalTierForLevel } from './terminalTier.js'

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
