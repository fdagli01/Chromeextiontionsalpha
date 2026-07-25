import * as radio from './radioPlayer.js'
import * as ambient from './ambient.js'
import { playStaticBurst } from './sfx.js'

/**
 * Unifies Russian's real-MP3 radio and the other themes' generative ambient
 * engine behind one interface, so the UI (a single "tune in / next channel"
 * control in the tab bar) doesn't need to branch on theme.id.
 * @param {string} themeId
 * @returns {boolean}
 */
export function hasThemeAudio(themeId) {
  return themeId === 'russian' || ambient.hasAmbient(themeId)
}

/** @param {string} themeId */
export function isThemeAudioPlaying(themeId) {
  return themeId === 'russian' ? radio.isRadioPlaying() : ambient.isAmbientPlaying()
}

/** @param {string} themeId */
export function getThemeAudioChannelLabel(themeId) {
  return themeId === 'russian' ? `CH-${radio.getCurrentChannel()}` : ambient.getAmbientChannelName(themeId)
}

/** @param {string} themeId */
export function playThemeAudio(themeId) {
  if (themeId === 'russian') radio.playRadio()
  else ambient.playAmbient(themeId)
}

/** @param {string} themeId */
export function pauseThemeAudio(themeId) {
  if (themeId === 'russian') radio.pauseRadio()
  else ambient.pauseAmbient()
}

/**
 * Stops every theme audio source, whichever engine it came from. Used on
 * theme switch: the per-theme pause above only reaches the *new* theme's
 * engine, so without this the old theme's soundscape (e.g. Portuguese
 * ocean waves) would keep playing underneath the new theme's radio.
 */
export function stopAllThemeAudio() {
  radio.pauseRadio()
  ambient.pauseAmbient()
}

/** @param {string} themeId */
export function nextThemeAudioChannel(themeId) {
  if (themeId === 'russian') radio.nextChannel()
  else ambient.nextAmbientChannel(themeId)
}

/**
 * Plays a brief thematic soundscape "sting" underneath a word's
 * pronunciation — radio static for Russian (reusing the tuning-in sound),
 * a generative ambient swell for the other themes.
 * @param {string} themeId
 */
export function playPronunciationSting(themeId) {
  if (themeId === 'russian') playStaticBurst()
  else ambient.playPronunciationSting(themeId)
}
