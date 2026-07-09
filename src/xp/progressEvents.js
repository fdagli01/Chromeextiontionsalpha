const EVENT_NAME = 'polyglot:progress-changed'

/**
 * Broadcasts that a theme's progress changed (e.g. after a graded review),
 * so any mounted component — not just the one that triggered the update —
 * can react, most notably ThemeProvider re-resolving its level-gated stage.
 * @param {string} themeId
 * @param {import('../db/progressRepo.js').ThemeProgress} progress
 */
export function emitProgressChanged(themeId, progress) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { themeId, progress } }))
}

/**
 * Subscribes to progress-changed events for a specific theme.
 * @param {string} themeId
 * @param {(progress: import('../db/progressRepo.js').ThemeProgress) => void} handler
 * @returns {() => void} unsubscribe
 */
export function onProgressChanged(themeId, handler) {
  function listener(event) {
    if (event.detail.themeId === themeId) handler(event.detail.progress)
  }
  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}
