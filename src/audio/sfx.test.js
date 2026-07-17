import { afterEach, describe, expect, it, vi } from 'vitest'

const oscillators = []
const buffers = []

function makeNode() {
  return {
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    type: undefined,
    buffer: undefined,
  }
}

vi.mock('./context.js', () => ({
  getAudioContext: () => ({
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: () => {
      const node = makeNode()
      oscillators.push(node)
      return node
    },
    createBufferSource: () => {
      const node = makeNode()
      buffers.push(node)
      return node
    },
    createGain: () => makeNode(),
    createBiquadFilter: () => makeNode(),
    createBuffer: (channels, length) => ({ getChannelData: () => new Float32Array(length) }),
  }),
}))

import {
  playSuccessSfx,
  playMissSfx,
  playSwordClash,
  playRetreatHorn,
  playBadgeUnlock,
  playQuestComplete,
  playStreakTierUp,
  playComboMilestone,
  playFactionPromotion,
  playSessionComplete,
  playFragmentRecovered,
  playAllyUnlocked,
} from './sfx.js'

afterEach(() => {
  oscillators.length = 0
  buffers.length = 0
  vi.restoreAllMocks()
})

describe('legion SFX variant (Italian theme)', () => {
  it('playSwordClash starts both a noise burst and a ringing tone', () => {
    playSwordClash(0)
    expect(buffers).toHaveLength(1)
    expect(oscillators).toHaveLength(1)
    expect(buffers[0].start).toHaveBeenCalled()
    expect(oscillators[0].start).toHaveBeenCalled()
  })

  it('playRetreatHorn starts a single descending oscillator', () => {
    playRetreatHorn()
    expect(oscillators).toHaveLength(1)
    expect(oscillators[0].start).toHaveBeenCalled()
  })

  it('dispatches to the legion sounds for the "legion" variant', () => {
    playSuccessSfx('legion', 2)
    expect(buffers).toHaveLength(1) // playSwordClash's noise burst

    playMissSfx('legion')
    expect(oscillators.at(-1).frequency.linearRampToValueAtTime).toHaveBeenCalled() // playRetreatHorn's descending sweep
  })
})

describe('progress-system SFX (theme-agnostic)', () => {
  it('playBadgeUnlock starts a chime of three oscillators plus a noise sparkle', () => {
    playBadgeUnlock()
    expect(oscillators).toHaveLength(3)
    expect(buffers).toHaveLength(1)
    oscillators.forEach((osc) => expect(osc.start).toHaveBeenCalled())
    expect(buffers[0].start).toHaveBeenCalled()
  })

  it('playQuestComplete starts a two-note chirp', () => {
    playQuestComplete()
    expect(oscillators).toHaveLength(2)
    oscillators.forEach((osc) => expect(osc.start).toHaveBeenCalled())
  })

  it('playStreakTierUp starts a crackle burst and a rising sweep', () => {
    playStreakTierUp()
    expect(buffers).toHaveLength(1)
    expect(oscillators).toHaveLength(1)
    expect(buffers[0].start).toHaveBeenCalled()
    expect(oscillators[0].start).toHaveBeenCalled()
  })

  it('playComboMilestone starts a single ascending sweep', () => {
    playComboMilestone()
    expect(oscillators).toHaveLength(1)
    expect(oscillators[0].frequency.exponentialRampToValueAtTime).toHaveBeenCalled()
  })

  it('playFactionPromotion starts a thud and a delayed ring', () => {
    playFactionPromotion()
    expect(oscillators).toHaveLength(2)
    oscillators.forEach((osc) => expect(osc.start).toHaveBeenCalled())
  })

  it('playSessionComplete starts a three-note cadence', () => {
    playSessionComplete()
    expect(oscillators).toHaveLength(3)
    oscillators.forEach((osc) => expect(osc.start).toHaveBeenCalled())
  })

  it('playFragmentRecovered starts a stone clunk plus a three-shard ascent', () => {
    playFragmentRecovered()
    expect(oscillators).toHaveLength(4)
    oscillators.forEach((osc) => expect(osc.start).toHaveBeenCalled())
  })

  it('playAllyUnlocked starts a warm two-note interval', () => {
    playAllyUnlocked()
    expect(oscillators).toHaveLength(2)
    oscillators.forEach((osc) => expect(osc.start).toHaveBeenCalled())
  })
})
