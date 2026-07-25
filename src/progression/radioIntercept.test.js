import { describe, expect, it } from 'vitest'
import { RADIO_CRISIS_CHANCE, judgeDictation, rollRadioCrisis } from './radioIntercept.js'

describe('rollRadioCrisis', () => {
  it('fires below the chance threshold and not above it', () => {
    expect(rollRadioCrisis(() => 0.001)).toBe(true)
    expect(rollRadioCrisis(() => 0.99)).toBe(false)
  })

  it('is rarer than a typical intercept-style roll', () => {
    expect(RADIO_CRISIS_CHANCE).toBeLessThan(0.05)
    expect(RADIO_CRISIS_CHANCE).toBeGreaterThan(0)
  })
})

describe('judgeDictation', () => {
  it('accepts an exact match', () => {
    expect(judgeDictation('товарищ', 'товарищ')).toBe(true)
  })

  it('accepts case and accent differences', () => {
    expect(judgeDictation('CAFE', 'café')).toBe(true)
    expect(judgeDictation('Actuellement', 'actuellement')).toBe(true)
  })

  it('tolerates a single stray typo on a longer word', () => {
    expect(judgeDictation('gladiatorx', 'gladiatore')).toBe(true)
  })

  it('rejects a wildly wrong or empty answer', () => {
    expect(judgeDictation('xyz', 'gladiatore')).toBe(false)
    expect(judgeDictation('', 'gladiatore')).toBe(false)
    expect(judgeDictation('   ', 'gladiatore')).toBe(false)
  })
})
