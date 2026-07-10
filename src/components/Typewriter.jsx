import { useEffect, useState } from 'react'

/**
 * Reveals text character-by-character, like a teletype printing an
 * intercepted transmission. Restarts whenever `text` changes.
 * @param {{text: string, speed?: number}} props
 */
export function Typewriter({ text, speed = 16 }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return <>{shown}</>
}
