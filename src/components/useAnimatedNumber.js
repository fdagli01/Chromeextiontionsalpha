import { useEffect, useRef, useState } from 'react'

/**
 * Animates a displayed number counting up (or down) toward `target`
 * whenever it changes, used for the XP counter so gains feel earned
 * instead of just snapping to a new value.
 * @param {number} target
 * @param {number} [durationMs]
 * @returns {number}
 */
export function useAnimatedNumber(target, durationMs = 600) {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)
  const frameRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    const start = performance.now()

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplay(Math.round(from + (target - from) * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, durationMs])

  return display
}
