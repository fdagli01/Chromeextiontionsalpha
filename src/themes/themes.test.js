import { describe, expect, it } from 'vitest'
import { defineTheme, resolveThemeStage, resolveThemeVisuals } from './base.js'
import { getTheme, listThemes } from './index.js'

const stagedTheme = defineTheme({
  id: 'test-staged',
  colors: { primary: '#111111' },
  emblem: 'A',
  stages: [
    { id: 'one', name: 'One', minLevel: 1, colors: {}, emblem: 'A' },
    { id: 'two', name: 'Two', minLevel: 4, colors: { primary: '#222222' }, emblem: 'B' },
    { id: 'three', name: 'Three', minLevel: 8, colors: { primary: '#333333' }, emblem: 'C' },
  ],
})

describe('resolveThemeStage', () => {
  it('returns null for a theme with no stages', () => {
    const plain = defineTheme({ id: 'plain' })
    expect(resolveThemeStage(plain, 10)).toBeNull()
  })

  it('picks the highest minLevel stage the player has reached', () => {
    expect(resolveThemeStage(stagedTheme, 1).id).toBe('one')
    expect(resolveThemeStage(stagedTheme, 5).id).toBe('two')
    expect(resolveThemeStage(stagedTheme, 20).id).toBe('three')
  })

  it('returns null below the lowest stage threshold', () => {
    const gatedTheme = defineTheme({
      id: 'gated',
      stages: [{ id: 'late', name: 'Late', minLevel: 5 }],
    })
    expect(resolveThemeStage(gatedTheme, 1)).toBeNull()
  })
})

describe('resolveThemeVisuals', () => {
  it('merges stage color overrides onto the base palette', () => {
    const visuals = resolveThemeVisuals(stagedTheme, 5)
    expect(visuals.colors.primary).toBe('#222222')
    expect(visuals.emblem).toBe('B')
    expect(visuals.stageName).toBe('Two')
  })

  it('falls back to the theme base colors/emblem before any stage is reached', () => {
    const gatedTheme = defineTheme({
      id: 'gated2',
      colors: { primary: '#abcabc' },
      emblem: 'Z',
      stages: [{ id: 'late', name: 'Late', minLevel: 5, colors: { primary: '#fff' } }],
    })
    const visuals = resolveThemeVisuals(gatedTheme, 1)
    expect(visuals.colors.primary).toBe('#abcabc')
    expect(visuals.emblem).toBe('Z')
    expect(visuals.stageName).toBeNull()
  })
})

describe('theme registry', () => {
  it('registers the Italian theme alongside Russian', () => {
    expect(listThemes().map((t) => t.id)).toEqual(expect.arrayContaining(['russian', 'italian']))
  })

  it('gives the Italian theme four level-gated stages', () => {
    const italian = getTheme('italian')
    expect(italian.stages).toHaveLength(4)
    expect(italian.stages.map((s) => s.minLevel)).toEqual([1, 4, 8, 14])
  })
})
