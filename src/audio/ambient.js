import { getAudioContext } from './context.js'

/**
 * Builds a noise buffer whose tail is crossfaded into its head, so looping
 * it produces no audible click/crackle at the seam. A plain looped buffer
 * of random samples jumps discontinuously every time it wraps — that jump
 * is exactly the periodic crackle a short raw noise loop produces.
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
 * Builds a procedural room/hall impulse response for the reverb: a burst of
 * noise whose energy decays exponentially, lowpassed so the tail darkens
 * over time like reflections off stone rather than glass. Cached per
 * (seconds, decay) since generating it is the priciest step here.
 */
const impulseCache = new Map()
function createReverbImpulse(context, seconds, decay) {
  const key = `${seconds}:${decay}:${context.sampleRate}`
  if (impulseCache.has(key)) return impulseCache.get(key)
  const length = Math.floor(context.sampleRate * seconds)
  const impulse = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  impulseCache.set(key, impulse)
  return impulse
}

/**
 * Builds one continuously-running generative ambient voice: a low drone, an
 * optional filtered-noise bed (with optional slow LFO "swell" on the
 * filter, for waves/wind), an optional bandpassed "murmur" bed with a slow
 * gain wobble (distant crowd/crew chatter, without needing recorded
 * speech), an optional synthetic-choir "chant" layer, and an optional
 * sparse plucked-note scheduler (bells, drums, gulls). Everything is mixed
 * through a shared convolution reverb (see `reverb` option) so the layers
 * sit together in one acoustic space — a hall, a quayside, a chamber —
 * instead of playing dry against the speaker. Fully procedural — no audio
 * assets, so it's copyright-safe and adds zero bytes to the package.
 * @returns {() => void} a stop function that fades out and tears down the graph
 */
function buildAmbientVoice(
  context,
  { droneFreqs = [], droneType = 'sine', droneGain = 0.06, reverb, noise, murmur, chant, pluck }
) {
  const now = context.currentTime
  const master = context.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(1, now + 2.5)

  // Wet/dry split: the wet path through the convolver is what makes the
  // layers read as "a place" rather than tones next to your ear. Defaults
  // lean wet on purpose — this is background atmosphere, not lead sound.
  const dryGain = context.createGain()
  dryGain.gain.value = reverb?.dry ?? 0.4
  const wetGain = context.createGain()
  wetGain.gain.value = reverb?.wet ?? 0.8
  const convolver = context.createConvolver()
  convolver.buffer = createReverbImpulse(context, reverb?.seconds ?? 3.5, reverb?.decay ?? 2.5)
  master.connect(dryGain).connect(context.destination)
  master.connect(convolver).connect(wetGain).connect(context.destination)

  // Drones run as slightly-detuned pairs through a dark lowpass: the detune
  // beats slowly against itself (organic movement instead of a flat test
  // tone), and the filter strips the buzzy upper harmonics that made raw
  // sawtooth/square drones sound like cheap synths.
  const droneLowpass = context.createBiquadFilter()
  droneLowpass.type = 'lowpass'
  droneLowpass.frequency.value = 320
  droneLowpass.connect(master)

  const droneOscs = droneFreqs.flatMap((freq) => {
    return [freq, freq * 1.004].map((f) => {
      const osc = context.createOscillator()
      osc.type = droneType
      osc.frequency.value = f
      const gain = context.createGain()
      gain.gain.value = droneGain / 2
      osc.connect(gain).connect(droneLowpass)
      osc.start()
      return osc
    })
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

  // Synthetic "human voice": sustained sawtooth tones passed through a
  // narrow bandpass (a crude vowel formant) with a slow vibrato per voice,
  // so several layered together read as a distant a cappella choir/chant
  // rather than an obviously-electronic drone. No recorded speech involved.
  const chantOscs = []
  const chantLfos = []
  if (chant) {
    // Shared vocal-register shaping: everything above ~1kHz is rolled off so
    // the "voices" sit far back in the room instead of buzzing up front.
    const chantDarkener = context.createBiquadFilter()
    chantDarkener.type = 'lowpass'
    chantDarkener.frequency.value = chant.darkness ?? 900
    chantDarkener.connect(master)

    chant.notes.forEach((freq, i) => {
      const osc = context.createOscillator()
      osc.type = chant.type ?? 'triangle'
      osc.frequency.value = freq
      const formant = context.createBiquadFilter()
      formant.type = 'bandpass'
      formant.frequency.value = chant.formantFreq ?? freq * 2
      formant.Q.value = chant.formantQ ?? 3
      const voiceGain = context.createGain()
      // Each voice fades in over several seconds, staggered, so the choir
      // assembles gradually the way distant singing registers — never a
      // synth chord snapping on.
      const target = chant.gain ?? 0.02
      voiceGain.gain.setValueAtTime(0.0001, now)
      voiceGain.gain.linearRampToValueAtTime(target, now + 4 + i * 1.5)
      osc.connect(formant).connect(voiceGain).connect(chantDarkener)
      osc.start()
      chantOscs.push(osc)

      const vibrato = context.createOscillator()
      vibrato.type = 'sine'
      vibrato.frequency.value = (chant.vibratoRate ?? 0.3) + i * 0.04
      const vibratoGain = context.createGain()
      vibratoGain.gain.value = chant.vibratoDepth ?? 2
      vibrato.connect(vibratoGain).connect(osc.frequency)
      vibrato.start()
      chantLfos.push(vibrato)

      // A slow "breath" swell per voice (offset phases across the choir):
      // voices rise and recede against each other, like phrases being sung,
      // rather than one static held cluster.
      const breath = context.createOscillator()
      breath.type = 'sine'
      breath.frequency.value = 0.05 + i * 0.017
      const breathGain = context.createGain()
      breathGain.gain.value = target * 0.5
      breath.connect(breathGain).connect(voiceGain.gain)
      breath.start()
      chantLfos.push(breath)
    })
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
      ;[noiseSource, noiseLfo, murmurSource, murmurLfo, ...chantOscs, ...chantLfos].forEach((node) => {
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
 * Russian's real MP3 tracks (see radioPlayer.js). Each theme gets several
 * channels, matching the "cycle through frequencies" UI metaphor.
 */
const THEME_AMBIENT_PRESETS = {
  italian: [
    {
      // A vast stone temple: long reverb tail, air moving through the
      // colonnade, a faint votive chant far behind the altar. The place is
      // the sound — the tones only color it.
      name: 'TEMPLVM',
      config: {
        reverb: { seconds: 5, decay: 2.2, wet: 0.9, dry: 0.3 },
        droneFreqs: [146.83],
        droneType: 'sine',
        droneGain: 0.03,
        noise: { filterType: 'lowpass', filterFreq: 260, gain: 0.05, waveLfo: { rate: 0.05, depth: 60 } },
        chant: { notes: [130.81, 196.0], type: 'triangle', gain: 0.012, darkness: 700, vibratoRate: 0.15, vibratoDepth: 1 },
        pluck: { notes: [392.0, 523.25], type: 'sine', minDelay: 9, maxDelay: 18, gain: 0.035, decay: 3 },
      },
    },
    {
      // The Senate in session: a chamber of overlapping debate — layered
      // crowd murmur with an orator's low voice rising over it now and
      // then, sandals and shuffling as a soft noise floor.
      name: 'SENATVS',
      config: {
        reverb: { seconds: 3.2, decay: 2.6, wet: 0.75, dry: 0.4 },
        droneFreqs: [98],
        droneType: 'sine',
        droneGain: 0.015,
        noise: { filterType: 'lowpass', filterFreq: 400, gain: 0.035, waveLfo: { rate: 0.11, depth: 90 } },
        murmur: { freq: 750, q: 1.0, gain: 0.055, wobbleRate: 0.21, wobbleDepth: 0.035 },
        chant: { notes: [110], type: 'triangle', gain: 0.014, darkness: 800, vibratoRate: 0.35, vibratoDepth: 3 },
        pluck: { notes: [220, 246.94], type: 'sine', minDelay: 7, maxDelay: 14, gain: 0.03, decay: 0.8 },
      },
    },
    {
      // A legion camp at dusk, heard from the rampart: wind over the plain,
      // distant drums keeping time, the low mass of men as murmur.
      name: 'LEGIO',
      config: {
        reverb: { seconds: 2.5, decay: 3, wet: 0.6, dry: 0.5 },
        droneFreqs: [82.41],
        droneType: 'sine',
        droneGain: 0.02,
        noise: { filterType: 'lowpass', filterFreq: 320, gain: 0.045, waveLfo: { rate: 0.07, depth: 110 } },
        murmur: { freq: 500, q: 1.2, gain: 0.03, wobbleRate: 0.13, wobbleDepth: 0.02 },
        pluck: { notes: [55, 65.41], type: 'sine', minDelay: 1.6, maxDelay: 2.2, gain: 0.1, decay: 0.5 },
      },
    },
    {
      // The oracle's cavern: dripping-stone stillness, a ritual chant that
      // swells and recedes in slow breaths, the longest reverb of the four.
      name: 'ORACVLVM',
      config: {
        reverb: { seconds: 6, decay: 2, wet: 1.0, dry: 0.25 },
        droneFreqs: [98],
        droneType: 'sine',
        droneGain: 0.02,
        noise: { filterType: 'lowpass', filterFreq: 200, gain: 0.03, waveLfo: { rate: 0.04, depth: 40 } },
        chant: { notes: [130.81, 164.81, 196.0], type: 'triangle', gain: 0.014, darkness: 650, vibratoRate: 0.18, vibratoDepth: 1.4 },
        pluck: { notes: [392.0, 440.0], type: 'sine', minDelay: 12, maxDelay: 24, gain: 0.03, decay: 3.5 },
      },
    },
  ],
  portuguese: [
    {
      // Open ocean — the channel that already worked; kept noise-first,
      // with only a light quayside reverb so the swell stays natural.
      name: 'OCEANO',
      config: {
        reverb: { seconds: 2.5, decay: 3.5, wet: 0.4, dry: 0.7 },
        droneFreqs: [55],
        droneType: 'sine',
        droneGain: 0.02,
        noise: { filterType: 'lowpass', filterFreq: 500, gain: 0.085, waveLfo: { rate: 0.09, depth: 260 } },
        murmur: { freq: 650, q: 1.3, gain: 0.022, wobbleRate: 0.13, wobbleDepth: 0.016 },
        pluck: { notes: [1200, 1400, 1600], type: 'sine', minDelay: 15, maxDelay: 35, gain: 0.025, decay: 0.2 },
      },
    },
    {
      // Lisbon harbor: water lapping the hulls, gulls overhead, dockworkers
      // and sailors as a live murmur — the "you are standing on the quay"
      // channel.
      name: 'PORTO',
      config: {
        reverb: { seconds: 2.8, decay: 3, wet: 0.55, dry: 0.55 },
        droneFreqs: [73.42],
        droneType: 'sine',
        droneGain: 0.015,
        noise: { filterType: 'lowpass', filterFreq: 420, gain: 0.06, waveLfo: { rate: 0.12, depth: 170 } },
        murmur: { freq: 620, q: 1.1, gain: 0.045, wobbleRate: 0.17, wobbleDepth: 0.03 },
        pluck: { notes: [1150, 1350, 1500], type: 'sine', minDelay: 6, maxDelay: 14, gain: 0.03, decay: 0.25 },
      },
    },
    {
      // The spice house: an enclosed trading floor — closer reverb, busier
      // haggling murmur, wood-creak floor noise, no sea.
      name: 'FEITORIA',
      config: {
        reverb: { seconds: 2.2, decay: 3, wet: 0.6, dry: 0.5 },
        droneFreqs: [73.42],
        droneType: 'sine',
        droneGain: 0.015,
        noise: { filterType: 'lowpass', filterFreq: 340, gain: 0.035, waveLfo: { rate: 0.09, depth: 70 } },
        murmur: { freq: 850, q: 1.2, gain: 0.05, wobbleRate: 0.24, wobbleDepth: 0.032 },
        pluck: { notes: [698.46, 830.61, 932.33], type: 'triangle', minDelay: 5, maxDelay: 10, gain: 0.03, decay: 1.2 },
      },
    },
    {
      // A seamen's chapel before departure: stone room, candle-quiet, a low
      // hymn in close harmony breathing in and out over the hush.
      name: 'CAPELA',
      config: {
        reverb: { seconds: 4.5, decay: 2.2, wet: 0.9, dry: 0.3 },
        droneFreqs: [65.41],
        droneType: 'sine',
        droneGain: 0.018,
        noise: { filterType: 'lowpass', filterFreq: 220, gain: 0.025, waveLfo: { rate: 0.05, depth: 40 } },
        chant: { notes: [130.81, 164.81, 196.0, 246.94], type: 'triangle', gain: 0.011, darkness: 750, vibratoRate: 0.16, vibratoDepth: 1.2 },
        pluck: { notes: [523.25, 659.25], type: 'sine', minDelay: 14, maxDelay: 26, gain: 0.025, decay: 2.5 },
      },
    },
  ],
  french: [
    {
      // A Paris street in 1793: crowd unrest as weather — murmur swelling
      // in waves, wind between buildings, a far-off drum now and then.
      name: 'RUE',
      config: {
        reverb: { seconds: 2.8, decay: 3, wet: 0.55, dry: 0.55 },
        droneFreqs: [130.81],
        droneType: 'sine',
        droneGain: 0.012,
        noise: { filterType: 'lowpass', filterFreq: 380, gain: 0.04, waveLfo: { rate: 0.08, depth: 120 } },
        murmur: { freq: 800, q: 1.0, gain: 0.055, wobbleRate: 0.18, wobbleDepth: 0.035 },
        pluck: { notes: [55, 65.41], type: 'sine', minDelay: 4, maxDelay: 8, gain: 0.09, decay: 0.5 },
      },
    },
    {
      // The Terror: same street, but the crowd is quieter and the drums are
      // closer — dread as absence, kept dark and low.
      name: 'TERREUR',
      config: {
        reverb: { seconds: 3.5, decay: 2.4, wet: 0.7, dry: 0.4 },
        droneFreqs: [87.31],
        droneType: 'sine',
        droneGain: 0.02,
        noise: { filterType: 'lowpass', filterFreq: 240, gain: 0.035, waveLfo: { rate: 0.05, depth: 60 } },
        murmur: { freq: 600, q: 1.2, gain: 0.03, wobbleRate: 0.1, wobbleDepth: 0.02 },
        pluck: { notes: [55], type: 'sine', minDelay: 2.2, maxDelay: 4, gain: 0.11, decay: 0.4 },
      },
    },
    {
      // A pre-revolution salon: a warm parlor — close reverb, glass-and-
      // silverware quiet, refined conversation, a harpsichord being played
      // unhurriedly in the corner.
      name: 'SALON',
      config: {
        reverb: { seconds: 1.8, decay: 3.2, wet: 0.5, dry: 0.6 },
        droneFreqs: [174.61],
        droneType: 'sine',
        droneGain: 0.01,
        noise: { filterType: 'lowpass', filterFreq: 300, gain: 0.02, waveLfo: { rate: 0.06, depth: 40 } },
        murmur: { freq: 950, q: 1.5, gain: 0.022, wobbleRate: 0.11, wobbleDepth: 0.013 },
        pluck: { notes: [349.23, 440.0, 523.25, 587.33, 698.46], type: 'triangle', minDelay: 2.5, maxDelay: 5.5, gain: 0.045, decay: 1.8 },
      },
    },
    {
      // The Tribunal: a cold high-ceilinged courtroom — a flat official
      // voice droning through charges, papers and coughs in the gallery,
      // the gavel landing every so often.
      name: 'TRIBUNAL',
      config: {
        reverb: { seconds: 4, decay: 2.3, wet: 0.8, dry: 0.35 },
        droneFreqs: [87.31],
        droneType: 'sine',
        droneGain: 0.014,
        noise: { filterType: 'lowpass', filterFreq: 280, gain: 0.03, waveLfo: { rate: 0.07, depth: 50 } },
        murmur: { freq: 700, q: 1.4, gain: 0.025, wobbleRate: 0.09, wobbleDepth: 0.015 },
        chant: { notes: [98, 123.47], type: 'triangle', gain: 0.013, darkness: 700, vibratoRate: 0.09, vibratoDepth: 0.6 },
        pluck: { notes: [65.41], type: 'sine', minDelay: 8, maxDelay: 15, gain: 0.07, decay: 0.5 },
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

/** How long a one-shot pronunciation sting rings out before fading, in ms. */
const STING_DURATION_MS = 1400

/**
 * Plays a brief, one-shot swell of a theme's ambient texture underneath a
 * word's pronunciation — a crowd murmur for French, distant surf for
 * Portuguese, a legion drone for Italian — without disturbing the
 * persistent "tune in the radio" ambient loop (if the player has one
 * running, this stings independently on top of it).
 * @param {string} themeId
 */
export function playPronunciationSting(themeId) {
  const presets = THEME_AMBIENT_PRESETS[themeId]
  if (!presets) return
  const channelIndex = themeId === currentThemeId ? currentChannelIndex : 0
  const stop = buildAmbientVoice(getAudioContext(), presets[channelIndex].config)
  setTimeout(stop, STING_DURATION_MS)
}
