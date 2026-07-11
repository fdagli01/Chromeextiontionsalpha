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

  // 80ms crossfade, clamped to half the buffer: for very short buffers (the
  // drum-click burst) a longer fade would index past the start of the data,
  // filling the buffer with NaN — which latches the whole audio graph silent.
  const fadeLength = Math.min(Math.floor(context.sampleRate * 0.08), Math.floor(length / 2))
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
 * The noise bed, differentiated by texture. Previously every channel used
 * the same recipe — lowpassed noise with one slow sinusoidal filter sweep —
 * which physically *is* the sound of surf, so temples and salons all read
 * as "ocean". Each type here has a genuinely different fingerprint:
 *
 * - `waves`: deep lowpass swells where brightness and loudness rise and
 *   fall together, like water rolling in and receding.
 * - `wind`: a hollow bandpass whistle whose center wanders irregularly
 *   (two incommensurate LFOs never repeat in phase) with separate gusting
 *   loudness — restless and airy, nothing like a periodic swell.
 * - `room`: a static, dark noise floor. A place's quiet, not weather.
 *
 * @returns {AudioScheduledSourceNode[]} started nodes for the stop teardown
 */
function buildNoiseBed(context, master, noise) {
  const source = context.createBufferSource()
  source.buffer = createLoopableNoiseBuffer(context, 6)
  source.loop = true
  const outGain = context.createGain()
  outGain.gain.value = noise.gain ?? 0.05
  const started = [source]

  if (noise.type === 'wind') {
    const bandpass = context.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = noise.freq ?? 650
    bandpass.Q.value = noise.q ?? 2.2
    source.connect(bandpass).connect(outGain).connect(master)

    // Two sweep LFOs at incommensurate rates: their sum never settles into
    // a repeating cycle, so the whistle wanders like real gusts instead of
    // breathing in and out on a fixed period (the "wave" tell).
    for (const [rate, depth] of [
      [noise.rate ?? 0.13, (noise.freq ?? 650) * 0.45],
      [(noise.rate ?? 0.13) * 0.29, (noise.freq ?? 650) * 0.3],
    ]) {
      const lfo = context.createOscillator()
      lfo.frequency.value = rate
      const lfoGain = context.createGain()
      lfoGain.gain.value = depth
      lfo.connect(lfoGain).connect(bandpass.frequency)
      lfo.start()
      started.push(lfo)
    }
    const gust = context.createOscillator()
    gust.frequency.value = (noise.rate ?? 0.13) * 0.61
    const gustGain = context.createGain()
    gustGain.gain.value = (noise.gain ?? 0.05) * 0.45
    gust.connect(gustGain).connect(outGain.gain)
    gust.start()
    started.push(gust)
  } else if (noise.type === 'waves') {
    const lowpass = context.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = noise.freq ?? 480
    source.connect(lowpass).connect(outGain).connect(master)

    // One LFO drives both the filter and the gain, so each swell gets
    // brighter as it gets louder — the crash-and-retreat shape of surf.
    const lfo = context.createOscillator()
    lfo.frequency.value = noise.rate ?? 0.08
    const filterDepth = context.createGain()
    filterDepth.gain.value = (noise.freq ?? 480) * 0.55
    lfo.connect(filterDepth).connect(lowpass.frequency)
    const ampDepth = context.createGain()
    ampDepth.gain.value = (noise.gain ?? 0.05) * 0.5
    lfo.connect(ampDepth).connect(outGain.gain)
    lfo.start()
    started.push(lfo)
  } else {
    // 'room': static dark floor, no movement to read as weather.
    const lowpass = context.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = noise.freq ?? 280
    source.connect(lowpass).connect(outGain).connect(master)
  }

  source.start()
  return started
}

// Formant frequencies (F1/F2/F3) for five vowels — the resonances that make
// a buzzy source read as a human voice saying "ah / eh / ee / oh / oo".
const VOWEL_FORMANTS = [
  [730, 1090, 2440],
  [530, 1840, 2480],
  [390, 1990, 2550],
  [570, 840, 2410],
  [440, 1020, 2240],
]
const FORMANT_LEVELS = [1, 0.45, 0.2]

/**
 * One synthetic talker: a sawtooth "glottal" buzz pushed through three
 * parallel vowel-formant bandpasses. A scheduler jumps pitch, vowel, and
 * loudness every syllable (~100–250ms) and inserts phrase-length pauses,
 * which is what makes it register as *speech* — actual talking cadence,
 * not a wobbling hiss like the old murmur layer. Gibberish by design:
 * no words, no recorded audio.
 * @returns {{ stop: () => void }}
 */
function buildTalker(context, destination, { baseFreq, gain, pace = 1, drawl = 1 }) {
  const osc = context.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = baseFreq
  const voiceGain = context.createGain()
  voiceGain.gain.value = 0
  const formants = VOWEL_FORMANTS[0].map((freq, i) => {
    const bandpass = context.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = freq
    bandpass.Q.value = 7
    const level = context.createGain()
    level.gain.value = FORMANT_LEVELS[i]
    osc.connect(bandpass).connect(level).connect(voiceGain)
    return bandpass
  })
  voiceGain.connect(destination)
  osc.start()

  let timerId = null
  let stopped = false
  function nextSyllable() {
    if (stopped) return
    const t = context.currentTime
    // ~1 in 6 syllables ends the phrase: voice drops out, then resumes
    // after a conversational gap. Constant sound is the giveaway of fake
    // chatter — real rooms breathe.
    if (Math.random() < 0.16) {
      voiceGain.gain.setTargetAtTime(0, t, 0.06)
      timerId = setTimeout(nextSyllable, (400 + Math.random() * 1800) / pace)
      return
    }
    const vowel = VOWEL_FORMANTS[Math.floor(Math.random() * VOWEL_FORMANTS.length)]
    vowel.forEach((freq, i) => {
      formants[i].frequency.setTargetAtTime(freq * (0.95 + Math.random() * 0.1), t, 0.02)
    })
    // Pitch contour: each syllable lands on a new pitch around the talker's
    // base — the rise and fall of a sentence, not a monotone drone.
    osc.frequency.setTargetAtTime(baseFreq * (0.85 + Math.random() * 0.35), t, 0.04)
    voiceGain.gain.setTargetAtTime(gain * (0.6 + Math.random() * 0.4), t, 0.03)
    timerId = setTimeout(nextSyllable, ((90 + Math.random() * 160) * drawl) / pace)
  }
  nextSyllable()

  return {
    stop() {
      stopped = true
      clearTimeout(timerId)
      voiceGain.gain.setTargetAtTime(0, context.currentTime, 0.05)
      try {
        osc.stop(context.currentTime + 0.3)
      } catch {
        /* already stopped */
      }
    },
  }
}

/** Cached 60ms noise burst for drum-hit attack transients. */
let clickBuffer = null
function getClickBuffer(context) {
  if (!clickBuffer || clickBuffer.sampleRate !== context.sampleRate) {
    clickBuffer = createLoopableNoiseBuffer(context, 0.06)
  }
  return clickBuffer
}

/**
 * One percussive hit: a sine that pitch-drops fast (the boom) plus a short
 * noise transient (the stick/skin attack). This is the punch the old engine
 * had nowhere — plucks decayed gently, nothing ever *hit*.
 */
function drumHit(context, destination, { freq = 110, gain = 0.25, decay = 0.35 }) {
  const t = context.currentTime
  const osc = context.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(Math.max(32, freq * 0.35), t + 0.09)
  const boomGain = context.createGain()
  boomGain.gain.setValueAtTime(gain, t)
  boomGain.gain.exponentialRampToValueAtTime(0.001, t + decay)
  osc.connect(boomGain).connect(destination)
  osc.start(t)
  osc.stop(t + decay + 0.05)

  const click = context.createBufferSource()
  click.buffer = getClickBuffer(context)
  const clickGain = context.createGain()
  clickGain.gain.setValueAtTime(gain * 0.5, t)
  clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
  click.connect(clickGain).connect(destination)
  click.start(t)
}

/**
 * Drum scheduler — the tension layer. Three feels:
 * - `march`: steady military time with an accented downbeat every 4th hit.
 * - `heartbeat`: the lub-dub pair with a long anxious gap between beats.
 * - `sparse`: lone far-off strikes at random intervals (gavel, temple drum).
 * @returns {() => void} cancel function
 */
function scheduleDrums(context, destination, drum) {
  let timerId = null
  let beat = 0
  let cancelled = false

  function next(delayMs) {
    timerId = setTimeout(() => {
      if (cancelled) return
      if (drum.pattern === 'march') {
        const accent = beat % 4 === 0
        drumHit(context, destination, {
          freq: drum.freq ?? 95,
          gain: (drum.gain ?? 0.2) * (accent ? 1.35 : 0.8),
          decay: accent ? 0.4 : 0.25,
        })
        beat++
        next((drum.interval ?? 0.55) * 1000)
      } else if (drum.pattern === 'heartbeat') {
        drumHit(context, destination, { freq: drum.freq ?? 70, gain: drum.gain ?? 0.22, decay: 0.3 })
        setTimeout(() => {
          if (!cancelled) drumHit(context, destination, { freq: (drum.freq ?? 70) * 0.85, gain: (drum.gain ?? 0.22) * 0.7, decay: 0.25 })
        }, 180)
        next(((drum.interval ?? 1.25) + Math.random() * 0.2) * 1000)
      } else {
        drumHit(context, destination, { freq: drum.freq ?? 80, gain: drum.gain ?? 0.25, decay: drum.decay ?? 0.5 })
        next((drum.minDelay + Math.random() * (drum.maxDelay - drum.minDelay)) * 1000)
      }
    }, delayMs)
  }
  next(600)

  return () => {
    cancelled = true
    clearTimeout(timerId)
  }
}

/**
 * Builds one continuously-running generative ambient voice from layers:
 * a low drone, a typed noise bed (`waves`/`wind`/`room` — see
 * `buildNoiseBed`), a crowd of syllable-scheduled synthetic talkers
 * (`crowd`, optionally with a louder `lead` orator — see `buildTalker`),
 * a synthetic-choir "chant" layer, a percussion scheduler for tension
 * (`drum` — march / heartbeat / sparse strikes), and a sparse plucked-note
 * scheduler (bells, gulls, harpsichord). Everything is mixed through a
 * shared convolution reverb (see `reverb` option) so the layers sit
 * together in one acoustic space — a hall, a quayside, a chamber —
 * instead of playing dry against the speaker. Fully procedural — no audio
 * assets, so it's copyright-safe and adds zero bytes to the package.
 * @returns {() => void} a stop function that fades out and tears down the graph
 */
function buildAmbientVoice(
  context,
  { droneFreqs = [], droneType = 'sine', droneGain = 0.06, reverb, noise, crowd, chant, drum, pluck }
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
  // sawtooth/square drones sound like cheap synths. Tension channels list
  // clashing droneFreqs (a semitone apart) so the pairs grind instead of hum.
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

  const noiseNodes = noise ? buildNoiseBed(context, master, noise) : []

  // Human voices: a handful of independent talkers at conversational
  // register makes a crowd; the optional lead is one louder, slower talker
  // rising over it (an orator, a judge, a preacher).
  const talkers = []
  if (crowd) {
    // Shared vocal darkener so the chatter sits back in the room instead of
    // spitting consonant-bright noise at the listener.
    const crowdDarkener = context.createBiquadFilter()
    crowdDarkener.type = 'lowpass'
    crowdDarkener.frequency.value = crowd.darkness ?? 2200
    crowdDarkener.connect(master)

    const count = crowd.count ?? 4
    for (let i = 0; i < count; i++) {
      // Mostly low (male-register) voices with some higher ones mixed in.
      const baseFreq = Math.random() < 0.65 ? 95 + Math.random() * 55 : 165 + Math.random() * 70
      talkers.push(
        buildTalker(context, crowdDarkener, {
          baseFreq,
          gain: crowd.gain ?? 0.05,
          pace: (crowd.pace ?? 1) * (0.85 + Math.random() * 0.3),
        })
      )
    }
    if (crowd.lead) {
      talkers.push(
        buildTalker(context, crowdDarkener, {
          baseFreq: crowd.lead.freq ?? 105,
          gain: crowd.lead.gain ?? 0.1,
          pace: crowd.lead.pace ?? 0.75,
          drawl: 1.6, // long, held syllables — declaiming, not chatting
        })
      )
    }
  }

  // Synthetic "singing voice": sustained tones passed through a narrow
  // bandpass (a crude vowel formant) with a slow vibrato per voice, so
  // several layered together read as a distant a cappella choir/chant
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

  const cancelDrums = drum ? scheduleDrums(context, master, drum) : null

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
    if (cancelDrums) cancelDrums()
    talkers.forEach((talker) => talker.stop())
    setTimeout(() => {
      ;[...droneOscs, ...noiseNodes, ...chantOscs, ...chantLfos].forEach((node) => {
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
 * channels, matching the "cycle through frequencies" UI metaphor. Every
 * channel commits to a mood — tense channels get grinding semitone drones
 * and drums, calm ones get consonant drones and space — and only the
 * genuinely coastal ones use the `waves` noise bed.
 */
const THEME_AMBIENT_PRESETS = {
  italian: [
    {
      // A vast stone temple: long reverb tail, still air (no weather —
      // you're indoors), a faint votive chant, a lone temple drum far off.
      // Mood: solemn calm.
      name: 'TEMPLVM',
      config: {
        reverb: { seconds: 5, decay: 2.2, wet: 0.9, dry: 0.3 },
        droneFreqs: [146.83],
        droneType: 'sine',
        droneGain: 0.03,
        noise: { type: 'room', freq: 240, gain: 0.03 },
        chant: { notes: [130.81, 196.0], type: 'triangle', gain: 0.014, darkness: 700, vibratoRate: 0.15, vibratoDepth: 1 },
        drum: { pattern: 'sparse', freq: 60, gain: 0.18, decay: 0.8, minDelay: 11, maxDelay: 22 },
        pluck: { notes: [392.0, 523.25], type: 'sine', minDelay: 9, maxDelay: 18, gain: 0.035, decay: 3 },
      },
    },
    {
      // The Senate in session: a chamber of real overlapping voices — a
      // crowd of talkers with an orator declaiming over them, and the
      // occasional strike of a staff on stone. Mood: charged debate.
      name: 'SENATVS',
      config: {
        reverb: { seconds: 3.2, decay: 2.6, wet: 0.75, dry: 0.4 },
        droneFreqs: [98],
        droneType: 'sine',
        droneGain: 0.012,
        noise: { type: 'room', freq: 320, gain: 0.02 },
        crowd: { count: 5, gain: 0.045, pace: 1.15, lead: { freq: 108, gain: 0.1, pace: 0.7 } },
        drum: { pattern: 'sparse', freq: 140, gain: 0.16, decay: 0.2, minDelay: 9, maxDelay: 20 },
      },
    },
    {
      // A legion on the march: wind over the plain (a whistle, not surf),
      // drums keeping military time with an accented downbeat, soldiers'
      // low talk between the beats. Mood: tension, movement.
      name: 'LEGIO',
      config: {
        reverb: { seconds: 2.5, decay: 3, wet: 0.6, dry: 0.5 },
        droneFreqs: [82.41, 87.31], // a semitone apart — the pair grinds
        droneType: 'sine',
        droneGain: 0.022,
        noise: { type: 'wind', freq: 620, gain: 0.035, rate: 0.14 },
        crowd: { count: 3, gain: 0.028, pace: 0.9 },
        drum: { pattern: 'march', freq: 92, gain: 0.2, interval: 0.55 },
      },
    },
    {
      // The oracle's cavern: a thin draft moaning through the rock, a
      // ritual chant, a deep drum every long while, the longest reverb of
      // the four. Mood: uneasy stillness.
      name: 'ORACVLVM',
      config: {
        reverb: { seconds: 6, decay: 2, wet: 1.0, dry: 0.25 },
        droneFreqs: [98],
        droneType: 'sine',
        droneGain: 0.02,
        noise: { type: 'wind', freq: 420, gain: 0.022, rate: 0.07 },
        chant: { notes: [130.81, 164.81, 196.0], type: 'triangle', gain: 0.014, darkness: 650, vibratoRate: 0.18, vibratoDepth: 1.4 },
        drum: { pattern: 'sparse', freq: 55, gain: 0.2, decay: 1.0, minDelay: 13, maxDelay: 26 },
      },
    },
  ],
  portuguese: [
    {
      // Open ocean — the one channel that IS waves, and now the only place
      // the wave texture lives. Swells that brighten as they crest, gulls
      // far up. Mood: vast calm.
      name: 'OCEANO',
      config: {
        reverb: { seconds: 2.5, decay: 3.5, wet: 0.4, dry: 0.7 },
        droneFreqs: [55],
        droneType: 'sine',
        droneGain: 0.02,
        noise: { type: 'waves', freq: 520, gain: 0.09, rate: 0.09 },
        pluck: { notes: [1200, 1400, 1600], type: 'sine', minDelay: 15, maxDelay: 35, gain: 0.025, decay: 0.2 },
      },
    },
    {
      // Lisbon harbor: lighter water against the hulls, gulls close, and —
      // finally audible — dockworkers and sailors actually talking on the
      // quay. Mood: lively, workmanlike.
      name: 'PORTO',
      config: {
        reverb: { seconds: 2.8, decay: 3, wet: 0.55, dry: 0.55 },
        droneFreqs: [73.42],
        droneType: 'sine',
        droneGain: 0.012,
        noise: { type: 'waves', freq: 440, gain: 0.045, rate: 0.12 },
        crowd: { count: 4, gain: 0.045, pace: 1.1 },
        pluck: { notes: [1150, 1350, 1500], type: 'sine', minDelay: 6, maxDelay: 14, gain: 0.03, decay: 0.25 },
      },
    },
    {
      // The spice house: an enclosed trading floor — no sea at all, just a
      // room and a busy crowd haggling over each other. Mood: bustle.
      name: 'FEITORIA',
      config: {
        reverb: { seconds: 2.2, decay: 3, wet: 0.6, dry: 0.5 },
        droneFreqs: [73.42],
        droneType: 'sine',
        droneGain: 0.012,
        noise: { type: 'room', freq: 300, gain: 0.022 },
        crowd: { count: 6, gain: 0.05, pace: 1.3 },
        pluck: { notes: [698.46, 830.61, 932.33], type: 'triangle', minDelay: 5, maxDelay: 10, gain: 0.03, decay: 1.2 },
      },
    },
    {
      // A seamen's chapel before departure: stone room, candle-quiet, a low
      // hymn in close harmony breathing in and out over the hush.
      // Mood: hushed calm.
      name: 'CAPELA',
      config: {
        reverb: { seconds: 4.5, decay: 2.2, wet: 0.9, dry: 0.3 },
        droneFreqs: [65.41],
        droneType: 'sine',
        droneGain: 0.018,
        noise: { type: 'room', freq: 200, gain: 0.02 },
        chant: { notes: [130.81, 164.81, 196.0, 246.94], type: 'triangle', gain: 0.012, darkness: 750, vibratoRate: 0.16, vibratoDepth: 1.2 },
        pluck: { notes: [523.25, 659.25], type: 'sine', minDelay: 14, maxDelay: 26, gain: 0.025, decay: 2.5 },
      },
    },
  ],
  french: [
    {
      // A Paris street in 1793: a real crowd of voices, wind funneling
      // between buildings, a drum striking somewhere a few streets over.
      // Mood: unrest building.
      name: 'RUE',
      config: {
        reverb: { seconds: 2.8, decay: 3, wet: 0.55, dry: 0.55 },
        droneFreqs: [130.81],
        droneType: 'sine',
        droneGain: 0.01,
        noise: { type: 'wind', freq: 560, gain: 0.028, rate: 0.12 },
        crowd: { count: 6, gain: 0.05, pace: 1.25 },
        drum: { pattern: 'sparse', freq: 85, gain: 0.2, decay: 0.5, minDelay: 6, maxDelay: 13 },
      },
    },
    {
      // The Terror: the crowd is gone. A grinding low drone, wind in the
      // empty street, and a heartbeat — lub-dub, wait, lub-dub. Mood: dread.
      name: 'TERREUR',
      config: {
        reverb: { seconds: 3.5, decay: 2.4, wet: 0.7, dry: 0.4 },
        droneFreqs: [55, 58.27], // clashing semitone — dread you can hear
        droneType: 'sine',
        droneGain: 0.026,
        noise: { type: 'wind', freq: 380, gain: 0.025, rate: 0.08 },
        crowd: { count: 2, gain: 0.02, pace: 0.75, darkness: 1400 },
        drum: { pattern: 'heartbeat', freq: 68, gain: 0.24, interval: 1.3 },
      },
    },
    {
      // A pre-revolution salon: a warm parlor — close reverb, a few refined
      // conversations at ease, a harpsichord being played unhurriedly in
      // the corner. Mood: polished calm.
      name: 'SALON',
      config: {
        reverb: { seconds: 1.8, decay: 3.2, wet: 0.5, dry: 0.6 },
        droneFreqs: [174.61],
        droneType: 'sine',
        droneGain: 0.008,
        noise: { type: 'room', freq: 260, gain: 0.016 },
        crowd: { count: 3, gain: 0.035, pace: 0.9 },
        pluck: { notes: [349.23, 440.0, 523.25, 587.33, 698.46], type: 'triangle', minDelay: 2.5, maxDelay: 5.5, gain: 0.045, decay: 1.8 },
      },
    },
    {
      // The Tribunal: a cold high-ceilinged courtroom — one flat official
      // voice droning through the charges over a subdued gallery, and the
      // gavel landing hard every so often. Mood: institutional menace.
      name: 'TRIBUNAL',
      config: {
        reverb: { seconds: 4, decay: 2.3, wet: 0.8, dry: 0.35 },
        droneFreqs: [87.31],
        droneType: 'sine',
        droneGain: 0.014,
        noise: { type: 'room', freq: 260, gain: 0.02 },
        crowd: { count: 2, gain: 0.02, pace: 0.8, lead: { freq: 98, gain: 0.09, pace: 0.6 } },
        drum: { pattern: 'sparse', freq: 150, gain: 0.26, decay: 0.25, minDelay: 8, maxDelay: 16 },
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
