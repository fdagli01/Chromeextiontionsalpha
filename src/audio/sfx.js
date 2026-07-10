import { getAudioContext } from './context.js'

/**
 * Converts a consecutive-correct combo count into a pitch multiplier
 * (equal-tempered semitone steps, capped so it never gets shrill).
 * @param {number} comboLevel
 * @returns {number}
 */
function comboPitchMultiplier(comboLevel) {
  return Math.pow(2, Math.min(comboLevel, 6) / 12)
}

/**
 * Short percussive "thunk", evoking a rubber stamp filing a confirmed word
 * away — played on a successful review. Pitches up slightly with a
 * consecutive-correct combo, so a streak audibly climbs.
 * @param {number} [comboLevel]
 */
export function playStamp(comboLevel = 0) {
  const context = getAudioContext()
  const now = context.currentTime
  const pitch = comboPitchMultiplier(comboLevel)

  const thump = context.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(120 * pitch, now)
  thump.frequency.exponentialRampToValueAtTime(40 * pitch, now + 0.15)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.5, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

  thump.connect(gain).connect(context.destination)
  thump.start(now)
  thump.stop(now + 0.2)
}

/**
 * Soft descending tone for a missed recall. Deliberately gentle — a review
 * app should never punish a wrong answer, just acknowledge it.
 */
export function playSoftMiss() {
  const context = getAudioContext()
  const now = context.currentTime

  const osc = context.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(330, now)
  osc.frequency.linearRampToValueAtTime(220, now + 0.2)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

  osc.connect(gain).connect(context.destination)
  osc.start(now)
  osc.stop(now + 0.25)
}

/**
 * Two detuned tones ringing out like a ship's bell — the Portuguese theme's
 * gentler stand-in for the KGB stamp thunk. Pitches up slightly with a
 * consecutive-correct combo, so a streak audibly climbs.
 * @param {number} [comboLevel]
 */
export function playShipBell(comboLevel = 0) {
  const context = getAudioContext()
  const now = context.currentTime
  const pitch = comboPitchMultiplier(comboLevel)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.22, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
  gain.connect(context.destination)

  const fundamental = context.createOscillator()
  fundamental.type = 'triangle'
  fundamental.frequency.setValueAtTime(660 * pitch, now)
  fundamental.connect(gain)
  fundamental.start(now)
  fundamental.stop(now + 1.2)

  const overtone = context.createOscillator()
  overtone.type = 'sine'
  overtone.frequency.setValueAtTime(1316 * pitch, now) // ~1320Hz, -8 cent detune
  const overtoneGain = context.createGain()
  overtoneGain.gain.setValueAtTime(0.12, now)
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
  overtone.connect(overtoneGain).connect(context.destination)
  overtone.start(now)
  overtone.stop(now + 1.0)
}

/**
 * A slower, lower miss tone than playSoftMiss — a wave receding rather than
 * a buzzer, for the Portuguese theme's deliberately non-punishing feedback.
 */
export function playDistantWave() {
  const context = getAudioContext()
  const now = context.currentTime

  const osc = context.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(330, now)
  osc.frequency.linearRampToValueAtTime(196, now + 0.4)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

  osc.connect(gain).connect(context.destination)
  osc.start(now)
  osc.stop(now + 0.45)
}

function createNoiseBuffer(context, seconds) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/**
 * Execution-drum hits (kick + noise snare), one per tier — the French
 * theme's session-tension escalation on a missed recall. `tier` is 1-2
 * (tier 3 uses playGuillotineSweep instead).
 * @param {number} tier
 */
export function playRevolutionDrum(tier) {
  const context = getAudioContext()
  const now = context.currentTime
  const hits = Math.max(1, Math.min(2, tier))

  for (let i = 0; i < hits; i++) {
    const t = now + i * 0.11

    const kick = context.createOscillator()
    kick.type = 'sine'
    kick.frequency.setValueAtTime(110, t)
    kick.frequency.exponentialRampToValueAtTime(40, t + 0.09)
    const kickGain = context.createGain()
    kickGain.gain.setValueAtTime(0.35, t)
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
    kick.connect(kickGain).connect(context.destination)
    kick.start(t)
    kick.stop(t + 0.1)

    const snare = context.createBufferSource()
    snare.buffer = createNoiseBuffer(context, 0.08)
    const snareGain = context.createGain()
    snareGain.gain.setValueAtTime(0.14, t)
    snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    snare.connect(snareGain).connect(context.destination)
    snare.start(t)
  }
}

/**
 * A falling blade sweep + muffled thud — the French theme's tier-3 (La
 * Terreur) miss sound, replacing the escalating drum with a single decisive
 * strike.
 */
export function playGuillotineSweep() {
  const context = getAudioContext()
  const now = context.currentTime

  const sweep = context.createOscillator()
  sweep.type = 'sawtooth'
  sweep.frequency.setValueAtTime(800, now)
  sweep.frequency.exponentialRampToValueAtTime(80, now + 0.3)
  const sweepGain = context.createGain()
  sweepGain.gain.setValueAtTime(0.15, now)
  sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
  sweep.connect(sweepGain).connect(context.destination)
  sweep.start(now)
  sweep.stop(now + 0.32)

  const thud = context.createBufferSource()
  thud.buffer = createNoiseBuffer(context, 0.17)
  const thudFilter = context.createBiquadFilter()
  thudFilter.type = 'lowpass'
  thudFilter.frequency.setValueAtTime(300, now)
  const thudGain = context.createGain()
  thudGain.gain.setValueAtTime(0.001, now)
  thudGain.gain.setValueAtTime(0.32, now + 0.28)
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
  thud.connect(thudFilter).connect(thudGain).connect(context.destination)
  thud.start(now)
}

/**
 * A short ascending four-note fanfare (C5-E5-G5-C6), played once when the
 * player levels up — deliberately theme-agnostic, since leveling up is a
 * progress-system event, not an in-world one.
 */
export function playLevelUpFanfare() {
  const context = getAudioContext()
  const now = context.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5]

  notes.forEach((freq, i) => {
    const t = now + i * 0.11
    const osc = context.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t)
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.connect(gain).connect(context.destination)
    osc.start(t)
    osc.stop(t + 0.42)
  })
}

/**
 * A short metallic clang — two gladii striking, filtered through a
 * highpass to keep it bright rather than boomy. The Italian theme's stand-in
 * for the KGB stamp thunk. Pitches up slightly with a consecutive-correct
 * combo, so a streak audibly climbs.
 * @param {number} [comboLevel]
 */
export function playSwordClash(comboLevel = 0) {
  const context = getAudioContext()
  const now = context.currentTime
  const pitch = comboPitchMultiplier(comboLevel)

  const clang = context.createBufferSource()
  clang.buffer = createNoiseBuffer(context, 0.12)

  const filter = context.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(1800 * pitch, now)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.28, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

  clang.connect(filter).connect(gain).connect(context.destination)
  clang.start(now)

  const ring = context.createOscillator()
  ring.type = 'triangle'
  ring.frequency.setValueAtTime(2200 * pitch, now)
  const ringGain = context.createGain()
  ringGain.gain.setValueAtTime(0.08, now)
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  ring.connect(ringGain).connect(context.destination)
  ring.start(now)
  ring.stop(now + 0.18)
}

/**
 * A low, descending brass tone — a legion's retreat horn — the Italian
 * theme's deliberately non-punishing miss sound.
 */
export function playRetreatHorn() {
  const context = getAudioContext()
  const now = context.currentTime

  const osc = context.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(196, now)
  osc.frequency.linearRampToValueAtTime(147, now + 0.35)

  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(500, now)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.18, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  osc.connect(filter).connect(gain).connect(context.destination)
  osc.start(now)
  osc.stop(now + 0.4)
}

/**
 * Dispatches to a theme's success SFX by variant, so callers don't need to
 * branch on theme.id directly. `comboLevel` (consecutive correct answers)
 * pitches the sound up, giving an audible sense of a streak building.
 * @param {string} [variant]
 * @param {number} [comboLevel]
 */
export function playSuccessSfx(variant, comboLevel = 0) {
  if (variant === 'nautical') return playShipBell(comboLevel)
  if (variant === 'legion') return playSwordClash(comboLevel)
  return playStamp(comboLevel)
}

/**
 * Dispatches to a theme's miss SFX by variant. `tier` only matters for the
 * "revolution" variant, where it drives the session-tension escalation.
 * @param {string} [variant]
 * @param {number} [tier]
 */
export function playMissSfx(variant, tier = 0) {
  if (variant === 'nautical') return playDistantWave()
  if (variant === 'legion') return playRetreatHorn()
  if (variant === 'revolution') {
    if (tier >= 3) return playGuillotineSweep()
    if (tier >= 1) return playRevolutionDrum(tier)
    return playSoftMiss()
  }
  return playSoftMiss()
}

/**
 * Short radio-static burst, played when tuning in or switching channels.
 */
export function playStaticBurst() {
  const context = getAudioContext()
  const now = context.currentTime

  const source = context.createBufferSource()
  source.buffer = createNoiseBuffer(context, 0.7)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)

  source.connect(gain).connect(context.destination)
  source.start(now)
}
