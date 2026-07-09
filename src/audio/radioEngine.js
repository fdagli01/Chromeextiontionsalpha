import { getAudioContext } from './context.js'

/**
 * Procedurally generated radio atmosphere — no audio files to ship or load.
 * Layers a filtered noise "static" bed under a slow minor-key march motif,
 * built entirely from Web Audio oscillators/buffers.
 */

// A minor-key march motif (A natural minor), looped with a fixed cadence.
const MARCH_NOTES_HZ = [220, 220, 261.63, 220, 196, 220, 246.94, 220]
const NOTE_INTERVAL_MS = 420

let noiseSource = null
let masterGain = null
let marchIntervalId = null

function createNoiseBuffer(context, seconds = 2) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function playMarchNote(context, destination, index) {
  const osc = context.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = MARCH_NOTES_HZ[index % MARCH_NOTES_HZ.length]

  const noteGain = context.createGain()
  const now = context.currentTime
  noteGain.gain.setValueAtTime(0.0001, now)
  noteGain.gain.linearRampToValueAtTime(0.35, now + 0.02)
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

  osc.connect(noteGain).connect(destination)
  osc.start(now)
  osc.stop(now + 0.4)
}

/**
 * Starts the Russian theme's radio atmosphere. Safe to call repeatedly —
 * a second call while already running is a no-op.
 * @param {number} volume - 0 to 1
 */
export function startRussianRadio(volume = 0.12) {
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
  staticGain.gain.value = 0.5

  noiseSource = context.createBufferSource()
  noiseSource.buffer = createNoiseBuffer(context)
  noiseSource.loop = true
  noiseSource.connect(staticFilter).connect(staticGain).connect(masterGain)
  noiseSource.start()

  let noteIndex = 0
  marchIntervalId = setInterval(() => {
    playMarchNote(context, masterGain, noteIndex)
    noteIndex += 1
  }, NOTE_INTERVAL_MS)
}

/** Stops and tears down the radio atmosphere. Safe to call when not running. */
export function stopRadio() {
  if (marchIntervalId) {
    clearInterval(marchIntervalId)
    marchIntervalId = null
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
