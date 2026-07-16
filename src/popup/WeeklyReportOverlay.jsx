import { useState } from 'react'
import { buildShareCard, copyToClipboard } from '../progression/shareCard.js'
import './WeeklyReportOverlay.css'

/**
 * A once-a-week (Monday, first open) summary of the prior 7 days across all
 * themes — reviewed count, accuracy, and the terms missed most often, framed
 * as an "intel report" to fit the dossier aesthetic. Purely informational,
 * dismissible, never blocks anything.
 * @param {{summary: {reviewed: number, correct: number, accuracyPct: number, topMissed: string[]}, terminalName?: string, onDismiss: () => void}} props
 */
export function WeeklyReportOverlay({ summary, terminalName, onDismiss }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const card = buildShareCard({
      title: terminalName || 'POLYGLOT CHRONICLE',
      subtitle: 'Weekly Intel Report',
      rows: [
        ['Reviewed', summary.reviewed],
        ['Accuracy', `${summary.accuracyPct}%`],
        ...(summary.topMissed.length > 0 ? [['At large', summary.topMissed.slice(0, 3).join(', ')]] : []),
      ],
      footer: 'via Polyglot Chronicle',
    })
    const ok = await copyToClipboard(card)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="weekly-report-overlay">
      <div className="weekly-report-card">
        <div className="weekly-report-label">📋 WEEKLY INTEL REPORT</div>
        <div className="weekly-report-stats">
          <div className="weekly-report-stat">
            <span className="weekly-report-value">{summary.reviewed}</span>
            <span className="weekly-report-stat-label">reviewed</span>
          </div>
          <div className="weekly-report-stat">
            <span className="weekly-report-value">{summary.accuracyPct}%</span>
            <span className="weekly-report-stat-label">accuracy</span>
          </div>
        </div>
        {summary.topMissed.length > 0 ? (
          <div className="weekly-report-suspects">
            <div className="weekly-report-suspects-head">SUSPECTS STILL AT LARGE</div>
            <ul className="weekly-report-suspects-list">
              {summary.topMissed.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="weekly-report-clean">No repeat offenders this week — clean record.</p>
        )}
        <div className="weekly-report-actions">
          <button className="weekly-report-share" onClick={share}>
            {copied ? '✓ COPIED' : '⧉ SHARE CARD'}
          </button>
          <button className="weekly-report-dismiss" onClick={onDismiss}>
            FILE REPORT →
          </button>
        </div>
      </div>
    </div>
  )
}
