import { useEffect, useState } from 'react'
import './BootSequence.css'

/**
 * A brief CRT "boot-up" overlay played when switching between mainframes
 * (themes), turning a plain palette swap into an event — scanlines sweep, a
 * cursor blinks through a couple of boot lines, then it fades to reveal the
 * new era. Purely cosmetic and self-dismissing after ~1.4s.
 * @param {{terminalName: string, onDone: () => void}} props
 */
export function BootSequence({ terminalName, onDone }) {
  const [line, setLine] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine(1), 350),
      setTimeout(() => setLine(2), 700),
      setTimeout(onDone, 1400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div className="boot-sequence" aria-hidden="true">
      <div className="boot-scanlines" />
      <div className="boot-console">
        <p className="boot-line">&gt; SEVERING LINK…</p>
        {line >= 1 && <p className="boot-line">&gt; ROUTING TO ARCHIVE…</p>}
        {line >= 2 && (
          <p className="boot-line boot-line-title">
            &gt; {terminalName} ONLINE<span className="boot-cursor">▊</span>
          </p>
        )}
      </div>
    </div>
  )
}
