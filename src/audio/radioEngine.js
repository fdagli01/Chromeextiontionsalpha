import { getAudioContext } from './context.js'

/**
 * Procedurally generated radio atmosphere — no audio files to ship or load.
 * A driving minor-key march (melody + bass + percussion) plays under a
 * filtered noise bed, with occasional static crackle bursts for realism.
 * Everything is synthesized with Web Audio oscillators/buffers.
 */

const TEMPO_BPM = 100
const BEAT_MS = (60 / TEMPO_BPM) * 1000 // eighth-note grid

// A 16-step march phrase in A natural minor. 0 = rest.
const MELODY_HZ = [
  220, 0, 261.63, 220, 196, 0, 220, 246.94,
  261.63, 0, 293.66, 261.63, 220, 0, 246.94, 196,
]
// Bass drum on the strong beats of the phrase (every 4th eighth-note step).
const KICK_STEPS = new Set([0, 4, 8, 12])
// Snare-like noise hit on the backbeat.
const SNARE_STEPS = new Set([2, 6, 10, 14])

let noiseSource = null
let masterGain = null
let stepIntervalId = null
let crackleTimeoutId = null
let stepIndex = 0

function createNoiseBuffer(context, seconds = 2) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function playMelodyNote(context, destination, freq, accent) {
  if (!freq) return
  const osc = context.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = freq

  const now = context.currentTime
  const peak = accent ? 0.4 : 0.28
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(peak, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

  osc.connect(gain).connect(destination)
  osc.start(now)
  osc.stop(now + 0.32)
}

function playKick(context, destination) {
  const osc = context.createOscillator()
  osc.type = 'sine'
  const now = context.currentTime
  osc.frequency.setValueAtTime(110, now)
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.12)

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.5, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

  osc.connect(gain).connect(destination)
  osc.start(now)
  osc.stop(now + 0.18)
}

function playSnare(context, destination) {
  const now = context.currentTime
  const source = context.createBufferSource()
  source.buffer = createNoiseBuffer(context, 0.2)

  const filter = context.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1500

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

  source.connect(filter).connect(gain).connect(destination)
  source.start(now)
  source.stop(now + 0.1)
}

function playCrackle(context, destination) {
  const now = context.currentTime
  const source = context.createBufferSource()
  source.buffer = createNoiseBuffer(context, 0.15)

  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 3000 + Math.random() * 2000

  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(0.35, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1 + Math.random() * 0.08)

  source.connect(filter).connect(gain).connect(destination)
  source.start(now)
  source.stop(now + 0.2)
}

function scheduleCrackle(context, destination) {
  const delay = 2500 + Math.random() * 5000
  crackleTimeoutId = setTimeout(() => {
    playCrackle(context, destination)
    scheduleCrackle(context, destination)
  }, delay)
}

/**
 * Starts the Russian theme's radio atmosphere. Safe to call repeatedly —
 * a second call while already running is a no-op.
 * @param {number} volume - 0 to 1
 */
export function startRussianRadio(volume = 0.16) {
  if (noiseSource) return

  const context = getAudioContext()

  masterGain = context.createGain()
  masterGain.gain.value = volume
  masterGain.connect(context.destination)

  const staticFilter = context.createBiquadFilter()
  staticFilter.type = 'bandpass'
  staticFilter.frequency.value = 1800
  staticFilter.Q.value = 0.7

  const staticGain = context.createGain()
  staticGain.gain.value = 0.35

  noiseSource = context.createBufferSource()
  noiseSource.buffer = createNoiseBuffer(context)
  noiseSource.loop = true
  noiseSource.connect(staticFilter).connect(staticGain).connect(masterGain)
  noiseSource.start()

  stepIndex = 0
  stepIntervalId = setInterval(() => {
    const i = stepIndex % MELODY_HZ.length
    const accent = i % 4 === 0
    playMelodyNote(context, masterGain, MELODY_HZ[i], accent)
    if (KICK_STEPS.has(i)) playKick(context, masterGain)
    if (SNARE_STEPS.has(i)) playSnare(context, masterGain)
    stepIndex += 1
  }, BEAT_MS)

  scheduleCrackle(context, masterGain)
}

/** Stops and tears down the radio atmosphere. Safe to call when not running. */
export function stopRadio() {
  if (stepIntervalId) {
    clearInterval(stepIntervalId)
    stepIntervalId = null
  }
  if (crackleTimeoutId) {
    clearTimeout(crackleTimeoutId)
    crackleTimeoutId = null
  }
  if (noiseSource) {
    noiseSource.stop()
    noiseSource.disconnect()
    noiseSource = null
  }
  if (masterGain) {
    masterGain.disconnect()
    masterGain = null
  }
}

export function isRadioPlaying() {
  return noiseSource !== null
}
