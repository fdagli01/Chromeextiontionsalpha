import { getAudioContext } from './context.js'

/**
 * Short percussive "thunk", evoking a rubber stamp filing a confirmed word
 * away — played on a successful review.
 */
export function playStamp() {
  const context = getAudioContext()
  const now = context.currentTime

  const thump = context.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(120, now)
  thump.frequency.exponentialRampToValueAtTime(40, now + 0.15)

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
