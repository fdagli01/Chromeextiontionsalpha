import './WeeklyReportOverlay.css'

/**
 * A once-a-week (Monday, first open) summary of the prior 7 days across all
 * themes — reviewed count, accuracy, and the terms missed most often, framed
 * as an "intel report" to fit the dossier aesthetic. Purely informational,
 * dismissible, never blocks anything.
 * @param {{summary: {reviewed: number, correct: number, accuracyPct: number, topMissed: string[]}, onDismiss: () => void}} props
 */
export function WeeklyReportOverlay({ summary, onDismiss }) {
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
        <button className="weekly-report-dismiss" onClick={onDismiss}>
          FILE REPORT →
        </button>
      </div>
    </div>
  )
}
