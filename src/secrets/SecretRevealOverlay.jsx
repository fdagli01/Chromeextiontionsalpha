import './SecretRevealOverlay.css'

/**
 * A one-time, full-card interstitial shown the first time a "secret" word
 * is correctly recalled — deliberately more dramatic than the routine
 * result panel, since the point is to make an easter-egg cultural fact feel
 * like a discovery rather than more of the same fact/philosophy copy.
 * @param {{secret: {title: string, icon: string, anecdote: string}, onDismiss: () => void}} props
 */
export function SecretRevealOverlay({ secret, onDismiss }) {
  return (
    <div className="secret-overlay">
      <div className="secret-card">
        <div className="secret-card-label">🔓 SECRET DISCOVERED</div>
        <div className="secret-card-icon">{secret.icon}</div>
        <div className="secret-card-title">{secret.title}</div>
        <p className="secret-card-anecdote">{secret.anecdote}</p>
        <button className="secret-dismiss-btn" onClick={onDismiss}>
          FASCINATING →
        </button>
      </div>
    </div>
  )
}
