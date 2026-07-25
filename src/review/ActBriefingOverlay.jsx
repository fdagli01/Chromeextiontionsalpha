import { createPortal } from 'react-dom'
import { getOverlayPortalTarget } from './overlayPortal.js'
import { markActSeen } from '../progression/acts.js'
import './ActBriefingOverlay.css'

/**
 * An act briefing: the cold open for a new era. The palette has just
 * shifted (or is about to); this says why, where history now stands, and
 * what this era wants from the player's desk.
 * @param {{themeId: string, act: import('../progression/acts.js').ActDef, onClose: () => void}} props
 */
export function ActBriefingOverlay({ themeId, act, onClose }) {
  async function acknowledge() {
    await markActSeen(themeId, act.id)
    onClose()
  }

  return createPortal(
    <div className="act-overlay" role="dialog" aria-modal="true" aria-label={act.title}>
      <div className="act-card">
        <div className="act-dateline">{act.dateline}</div>
        <div className="act-rule" aria-hidden="true" />
        <h2 className="act-title">{act.title}</h2>
        <p className="act-body">{act.body}</p>
        <div className="act-standing">
          <span className="act-standing-label">STANDING ORDER</span>
          <span className="act-standing-text">{act.standing}</span>
        </div>
        <button className="act-dismiss" onClick={acknowledge}>
          BEGIN →
        </button>
      </div>
    </div>,
    getOverlayPortalTarget()
  )
}
