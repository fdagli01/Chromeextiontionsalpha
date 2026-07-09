let sharedContext = null

/**
 * Lazily creates a single shared AudioContext for the popup session.
 * Browsers require a user gesture before audio can start, so this is only
 * ever called from click/toggle handlers, never on mount.
 * @returns {AudioContext}
 */
export function getAudioContext() {
  if (!sharedContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    sharedContext = new AudioContextClass()
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume()
  }
  return sharedContext
}
