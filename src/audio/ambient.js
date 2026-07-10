import { getAudioContext } from './context.js'

function createNoiseBuffer(context, seconds) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/**
 * Builds one continuously-running generative ambient voice: a low drone,
 * an optional filtered-noise bed (with optional slow LFO "swell" on the
 * filter, for waves/wind), and an optional sparse plucked-note scheduler
 * (for distant bells, drums, or arpeggios). Fully procedural — no audio
 * assets, so it's copyright-safe and adds zero bytes to the package.
 * @returns {() => void} a stop function that fades out and tears down the graph
 */
function buildAmbientVoice(context, { droneFreqs = [], droneType = 'sine', droneGain = 0.06, noise, pluck }) {
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
    noiseSource.buffer = createNoiseBuffer(context, 4)
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
      if (noiseSource) {
        try {
          noiseSource.stop()
        } catch {
          /* already stopped */
        }
      }
      if (noiseLfo) {
        try {
          noiseLfo.stop()
        } catch {
          /* already stopped */
        }
      }
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
        noise: { filterType: 'lowpass', filterFreq: 400, gain: 0.05, waveLfo: { rate: 0.08, depth: 180 } },
        pluck: { notes: [1200, 1400, 1600], type: 'sawtooth', minDelay: 15, maxDelay: 35, gain: 0.03, decay: 0.15 },
      },
    },
    {
      name: 'PORTO',
      config: {
        droneFreqs: [98, 146.83],
        droneType: 'triangle',
        droneGain: 0.03,
        noise: { filterType: 'lowpass', filterFreq: 300, gain: 0.04, waveLfo: { rate: 0.05, depth: 120 } },
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
        noise: { filterType: 'bandpass', filterFreq: 900, gain: 0.05 },
        pluck: { notes: [55, 65.41], type: 'sine', minDelay: 2.5, maxDelay: 5, gain: 0.15, decay: 0.3 },
      },
    },
    {
      name: 'TERREUR',
      config: {
        droneFreqs: [98, 146.83],
        droneType: 'sawtooth',
        droneGain: 0.02,
        noise: { filterType: 'bandpass', filterFreq: 700, gain: 0.06 },
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
