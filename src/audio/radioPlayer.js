import track1 from '../assets/audio/russian/track1.mp3'
import track2 from '../assets/audio/russian/track2.mp3'
import track3 from '../assets/audio/russian/track3.mp3'
import track4 from '../assets/audio/russian/track4.mp3'
import { playStaticBurst } from './sfx.js'

/**
 * A real, looping music-bed radio — 4 curated tracks the user can cycle
 * through, with a static burst on start/switch for that "tuning in" feel.
 * Only usable from a DOM context (the popup), not the background service
 * worker, since it drives an HTMLAudioElement.
 */
const PLAYLIST = [track1, track2, track3, track4]
const TARGET_VOLUME = 0.3

let audioEl = null
let currentIndex = 0
let playing = false

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

function loadChannel(index, autoplay) {
  const el = ensureAudioEl()
  currentIndex = ((index % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length
  el.src = PLAYLIST[currentIndex]
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
  return PLAYLIST.length
}
