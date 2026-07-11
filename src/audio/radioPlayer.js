import { playStaticBurst } from './sfx.js'

/**
 * A real, looping music-bed radio — 4 curated tracks the user can cycle
 * through, with a static burst on start/switch for that "tuning in" feel.
 * Only usable from a DOM context (the popup), not the background service
 * worker, since it drives an HTMLAudioElement.
 *
 * The tracks (~12MB combined) are loaded via dynamic import so they're
 * split into their own chunks and only fetched the first time the Russian
 * theme's radio is actually opened, instead of bloating every install with
 * music most players may never hear.
 */
const TRACK_LOADERS = [
  () => import('../assets/audio/russian/track1.mp3'),
  () => import('../assets/audio/russian/track2.mp3'),
  () => import('../assets/audio/russian/track3.mp3'),
  () => import('../assets/audio/russian/track4.mp3'),
]
const TARGET_VOLUME = 0.3

let audioEl = null
let currentIndex = 0
let playing = false
let loadToken = 0

function ensureAudioEl() {
  if (!audioEl) {
    audioEl = new Audio()
    audioEl.loop = true
    audioEl.onerror = () => {
      if (playing) nextChannel()
    }
  }
  return audioEl
}

async function loadChannel(index, autoplay) {
  const el = ensureAudioEl()
  currentIndex = ((index % TRACK_LOADERS.length) + TRACK_LOADERS.length) % TRACK_LOADERS.length
  const requestedIndex = currentIndex
  const token = ++loadToken

  const { default: src } = await TRACK_LOADERS[requestedIndex]()
  // Bail if paused, or another channel switch/track load started, while the
  // dynamic import was in flight.
  if (token !== loadToken || !playing) return

  el.src = src
  el.volume = 0
  if (autoplay) {
    playStaticBurst()
    el.play().catch(() => {})
    const fadeStart = performance.now()
    const fade = () => {
      const elapsed = performance.now() - fadeStart
      el.volume = Math.min(TARGET_VOLUME, (elapsed / 800) * TARGET_VOLUME)
      if (el.volume < TARGET_VOLUME) requestAnimationFrame(fade)
    }
    requestAnimationFrame(fade)
  }
}

/** @param {number} [startChannel] */
export function playRadio(startChannel = currentIndex) {
  playing = true
  loadChannel(startChannel, true)
}

export function pauseRadio() {
  playing = false
  loadToken += 1
  if (audioEl) audioEl.pause()
}

export function nextChannel() {
  loadChannel(currentIndex + 1, playing)
}

export function isRadioPlaying() {
  return playing
}

export function getCurrentChannel() {
  return currentIndex + 1
}

export function getChannelCount() {
  return TRACK_LOADERS.length
}
