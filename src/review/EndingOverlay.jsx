import { createPortal } from 'react-dom'
import { getOverlayPortalTarget } from './overlayPortal.js'
import { claimEnding } from '../progression/endings.js'
import './EndingOverlay.css'

/**
 * The ending: a one-time, full-screen epilogue earned by completing a
 * theme's entire arc — top rank AND every persona's story resolved. No
 * choice here; the choices already happened, scene by scene, over the
 * whole run. This is where they add up.
 * @param {{themeId: string, ending: import('../progression/endings.js').EndingDef, onClose: () => void}} props
 */
export function EndingOverlay({ themeId, ending, onClose }) {
  async function acknowledge() {
    await claimEnding(themeId, ending)
    onClose()
  }

  return createPortal(
    <div className="ending-overlay" role="dialog" aria-modal="true" aria-label={ending.title}>
      <div className="ending-card">
        <div className="ending-label">◆ ◆ ◆ ARCHIVE COMPLETE ◆ ◆ ◆</div>
        <div className="ending-title">{ending.title}</div>
        <p className="ending-body">{ending.body}</p>
        <button className="ending-continue-btn" onClick={acknowledge}>
          CLOSE THE FILE
        </button>
      </div>
    </div>,
    getOverlayPortalTarget()
  )
}
