import { getAudioContext } from './context.js'

/**
 * Builds a noise buffer whose tail is crossfaded into its head, so looping
 * it produces no audible click/crackle at the seam. A plain looped buffer
 * of random samples jumps discontinuously every time it wraps — that jump
 * is exactly the periodic "çıtırtı" a short raw noise loop produces.
 */
function createLoopableNoiseBuffer(context, seconds) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1

  const fadeLength = Math.floor(context.sampleRate * 0.08) // 80ms crossfade
  for (let i = 0; i < fadeLength; i++) {
    const fadeOut = 1 - i / fadeLength
    const fadeIn = i / fadeLength
    const tailIndex = length - fadeLength + i
    const blended = data[tailIndex] * fadeOut + data[i] * fadeIn
    data[tailIndex] = blended
    data[i] = blended
  }
  return buffer
}

/**
 * Builds one continuously-running generative ambient voice: a low drone, an
 * optional filtered-noise bed (with optional slow LFO "swell" on the
 * filter, for waves/wind), an optional bandpassed "murmur" bed with a slow
 * gain wobble (distant crowd/crew chatter, without needing recorded
 * speech), and an optional sparse plucked-note scheduler (bells, drums,
 * gulls). Fully procedural — no audio assets, so it's copyright-safe and
 * adds zero bytes to the package.
 * @returns {() => void} a stop function that fades out and tears down the graph
 */
function buildAmbientVoice(context, { droneFreqs = [], droneType = 'sine', droneGain = 0.06, noise, murmur, pluck }) {
  const now = context.currentTime
  const master = context.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(1, now + 1.5)
  master.connect(context.destination)

  const droneOscs = droneFreqs.map((freq) => {
    const osc = context.createOscillator()
    osc.type = droneType
    osc.frequency.value = freq
    const gain = context.createGain()
    gain.gain.value = droneGain
    osc.connect(gain).connect(master)
    osc.start()
    return osc
  })

  let noiseSource = null
  let noiseLfo = null
  if (noise) {
    noiseSource = context.createBufferSource()
    noiseSource.buffer = createLoopableNoiseBuffer(context, 6)
    noiseSource.loop = true
    const filter = context.createBiquadFilter()
    filter.type = noise.filterType ?? 'lowpass'
    filter.frequency.value = noise.filterFreq ?? 400
    const noiseGain = context.createGain()
    noiseGain.gain.value = noise.gain ?? 0.05
    noiseSource.connect(filter).connect(noiseGain).connect(master)
    noiseSource.start()

    if (noise.waveLfo) {
      noiseLfo = context.createOscillator()
      noiseLfo.frequency.value = noise.waveLfo.rate
      const lfoGain = context.createGain()
      lfoGain.gain.value = noise.waveLfo.depth
      noiseLfo.connect(lfoGain).connect(filter.frequency)
      noiseLfo.start()
    }
  }

  // Distant murmur (crew/crowd chatter stand-in): bandpassed noise in the
  // vocal register, with its gain slowly wobbling via an LFO so it reads as
  // voices rising and falling rather than a flat hiss.
  let murmurSource = null
  let murmurLfo = null
  if (murmur) {
    murmurSource = context.createBufferSource()
    murmurSource.buffer = createLoopableNoiseBuffer(context, 7)
    murmurSource.loop = true
    const bandpass = context.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = murmur.freq ?? 700
    bandpass.Q.value = murmur.q ?? 1.2
    const murmurGain = context.createGain()
    murmurGain.gain.value = murmur.gain ?? 0.03
    murmurSource.connect(bandpass).connect(murmurGain).connect(master)
    murmurSource.start()

    murmurLfo = context.createOscillator()
    murmurLfo.type = 'sine'
    murmurLfo.frequency.value = murmur.wobbleRate ?? 0.15
    const wobbleGain = context.createGain()
    wobbleGain.gain.value = murmur.wobbleDepth ?? (murmur.gain ?? 0.03) * 0.6
    murmurLfo.connect(wobbleGain).connect(murmurGain.gain)
    murmurLfo.start()
  }

  let pluckTimeoutId = null
  function schedulePluck() {
    const delay = pluck.minDelay + Math.random() * (pluck.maxDelay - pluck.minDelay)
    pluckTimeoutId = setTimeout(() => {
      const t = context.currentTime
      const freq = pluck.notes[Math.floor(Math.random() * pluck.notes.length)]
      const osc = context.createOscillator()
      osc.type = pluck.type ?? 'triangle'
      osc.frequency.value = freq
      const gain = context.createGain()
      const decay = pluck.decay ?? 1.5
      gain.gain.setValueAtTime(pluck.gain ?? 0.08, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay)
      osc.connect(gain).connect(master)
      osc.start(t)
      osc.stop(t + decay + 0.1)
      schedulePluck()
    }, delay * 1000)
  }
  if (pluck) schedulePluck()

  return function stop() {
    const t = context.currentTime
    master.gain.cancelScheduledValues(t)
    master.gain.setValueAtTime(master.gain.value, t)
    master.gain.linearRampToValueAtTime(0, t + 0.6)
    if (pluckTimeoutId) clearTimeout(pluckTimeoutId)
    setTimeout(() => {
      droneOscs.forEach((o) => {
        try {
          o.stop()
        } catch {
          /* already stopped */
        }
      })
      ;[noiseSource, noiseLfo, murmurSource, murmurLfo].forEach((node) => {
        if (!node) return
        try {
          node.stop()
        } catch {
          /* already stopped */
        }
      })
      master.disconnect()
    }, 700)
  }
}

/**
 * Per-theme generative "radio channels" — the copyright-safe stand-in for
 * Russian's real MP3 tracks (see radioPlayer.js). Each theme gets 2
 * channels, matching the "cycle through frequencies" UI metaphor.
 */
const THEME_AMBIENT_PRESETS = {
  italian: [
    {
      name: 'TEMPLVM',
      config: {
        droneFreqs: [146.83, 220.0],
        droneType: 'sine',
        droneGain: 0.05,
        noise: { filterType: 'lowpass', filterFreq: 220, gain: 0.015 },
        pluck: { notes: [293.66, 349.23, 392.0, 440.0, 523.25], type: 'triangle', minDelay: 3, maxDelay: 7, gain: 0.06, decay: 2.2 },
      },
    },
    {
      name: 'LEGIO',
      config: {
        droneFreqs: [110, 164.81],
        droneType: 'sine',
        droneGain: 0.04,
        pluck: { notes: [55, 65.41], type: 'sine', minDelay: 0.9, maxDelay: 1.1, gain: 0.18, decay: 0.35 },
      },
    },
  ],
  portuguese: [
    {
      name: 'OCEANO',
      config: {
        droneFreqs: [55, 82.41],
        droneType: 'sine',
        droneGain: 0.035,
        noise: { filterType: 'lowpass', filterFreq: 500, gain: 0.075, waveLfo: { rate: 0.09, depth: 260 } },
        murmur: { freq: 650, q: 1.3, gain: 0.028, wobbleRate: 0.13, wobbleDepth: 0.02 },
        pluck: { notes: [1200, 1400, 1600], type: 'sawtooth', minDelay: 15, maxDelay: 35, gain: 0.03, decay: 0.15 },
      },
    },
    {
      name: 'PORTO',
      config: {
        droneFreqs: [98, 146.83],
        droneType: 'triangle',
        droneGain: 0.03,
        noise: { filterType: 'lowpass', filterFreq: 350, gain: 0.05, waveLfo: { rate: 0.06, depth: 150 } },
        murmur: { freq: 550, q: 1.4, gain: 0.024, wobbleRate: 0.1, wobbleDepth: 0.016 },
        pluck: { notes: [440, 523.25], type: 'triangle', minDelay: 6, maxDelay: 12, gain: 0.05, decay: 1.8 },
      },
    },
  ],
  french: [
    {
      name: 'RUE',
      config: {
        droneFreqs: [130.81, 196.0],
        droneType: 'sine',
        droneGain: 0.02,
        murmur: { freq: 900, q: 1.1, gain: 0.05, wobbleRate: 0.18, wobbleDepth: 0.025 },
        pluck: { notes: [55, 65.41], type: 'sine', minDelay: 2.5, maxDelay: 5, gain: 0.15, decay: 0.3 },
      },
    },
    {
      name: 'TERREUR',
      config: {
        droneFreqs: [98, 146.83],
        droneType: 'sawtooth',
        droneGain: 0.02,
        murmur: { freq: 700, q: 1.1, gain: 0.06, wobbleRate: 0.25, wobbleDepth: 0.03 },
        pluck: { notes: [55], type: 'sine', minDelay: 1.2, maxDelay: 2.2, gain: 0.2, decay: 0.25 },
      },
    },
  ],
}

let currentThemeId = null
let currentChannelIndex = 0
let currentStop = null
let playing = false

/** @param {string} themeId */
export function hasAmbient(themeId) {
  return Boolean(THEME_AMBIENT_PRESETS[themeId])
}

/** @param {string} themeId */
export function playAmbient(themeId) {
  const presets = THEME_AMBIENT_PRESETS[themeId]
  if (!presets) return
  if (currentThemeId !== themeId) currentChannelIndex = 0
  currentThemeId = themeId

  if (currentStop) currentStop()
  currentStop = buildAmbientVoice(getAudioContext(), presets[currentChannelIndex].config)
  playing = true
}

export function pauseAmbient() {
  if (currentStop) {
    currentStop()
    currentStop = null
  }
  playing = false
}

/** @param {string} themeId */
export function nextAmbientChannel(themeId) {
  const presets = THEME_AMBIENT_PRESETS[themeId]
  if (!presets) return
  currentChannelIndex = (currentChannelIndex + 1) % presets.length
  playAmbient(themeId)
}

export function isAmbientPlaying() {
  return playing
}

/** @param {string} themeId */
export function getAmbientChannelName(themeId) {
  return THEME_AMBIENT_PRESETS[themeId]?.[currentChannelIndex]?.name ?? ''
}

/** @param {string} themeId */
export function getAmbientChannelCount(themeId) {
  return THEME_AMBIENT_PRESETS[themeId]?.length ?? 0
}
