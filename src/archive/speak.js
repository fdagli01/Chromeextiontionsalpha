/**
 * Speaks a term using the browser's built-in Web Speech API — no API key,
 * no network call. Silently no-ops if the API isn't available.
 * @param {string} text
 * @param {string} languageCode - BCP-47 code, e.g. "ru"
 */
export function speakTerm(text, languageCode) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = languageCode
  window.speechSynthesis.speak(utterance)
}
