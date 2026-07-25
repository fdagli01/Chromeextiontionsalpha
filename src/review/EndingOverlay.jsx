import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getOverlayPortalTarget } from './overlayPortal.js'
import { claimEnding } from '../progression/endings.js'
import { suggestNextEra } from '../progression/distinctions.js'
import './EndingOverlay.css'

/**
 * The ending: a one-time, full-screen epilogue earned by completing a
 * theme's entire arc — top rank AND every persona's story resolved. No
 * choice here; the choices already happened, scene by scene, over the
 * whole run. This is where they add up.
 *
 * It also carries the only invitation in the app to leave: a player who
 * finishes an era is at the exact moment they are most likely to stop
 * using it entirely, so this is where an unstarted era gets named. The
 * distinction they just earned will be waiting for them there.
 * @param {{themeId: string, ending: import('../progression/endings.js').EndingDef, onClose: (nextEraId: string | null) => void}} props
 */
export function EndingOverlay({ themeId, ending, onClose }) {
  const [nextEra, setNextEra] = useState(null)

  useEffect(() => {
    let cancelled = false
    suggestNextEra(themeId).then((era) => {
      if (!cancelled) setNextEra(era)
    })
    return () => {
      cancelled = true
    }
  }, [themeId])

  async function acknowledge(nextEraId = null) {
    await claimEnding(themeId, ending)
    onClose(nextEraId)
  }

  return createPortal(
    <div className="ending-overlay" role="dialog" aria-modal="true" aria-label={ending.title}>
      <div className="ending-card">
        <div className="ending-label">◆ ◆ ◆ ARCHIVE COMPLETE ◆ ◆ ◆</div>
        <div className="ending-title">{ending.title}</div>
        <p className="ending-body">{ending.body}</p>

        {nextEra && (
          <div className="ending-next-era">
            <div className="ending-next-label">A DESK STANDS EMPTY</div>
            <p className="ending-next-copy">
              <span className="ending-next-emblem" aria-hidden="true">{nextEra.emblem}</span>
              {nextEra.themeName} — {nextEra.era}. Your service here goes on the record there.
            </p>
            <button className="ending-next-btn" onClick={() => acknowledge(nextEra.themeId)}>
              REPORT TO {nextEra.themeName} →
            </button>
          </div>
        )}

        <button className="ending-continue-btn" onClick={() => acknowledge(null)}>
          CLOSE THE FILE
        </button>
      </div>
    </div>,
    getOverlayPortalTarget()
  )
}
