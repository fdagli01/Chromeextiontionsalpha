import { useState } from 'react'
import { allObjectivesComplete } from '../progression/briefing.js'
import './DailyBriefingOverlay.css'

/**
 * A once-per-day "mission briefing" shown on the first open of the day. It
 * starts as a sealed envelope the player breaks open (a small ritual that
 * marks the start of a session), revealing the day's three objectives with
 * live progress. Objectives are real, tracked goals (see progression/
 * briefing.js) — carried-over progress from earlier in the day shows as
 * already ticked.
 * @param {{
 *   terminalName?: string,
 *   objectives: import('../progression/briefing.js').BriefingObjective[],
 *   onDismiss: () => void,
 * }} props
 */
export function DailyBriefingOverlay({ terminalName, objectives, onDismiss }) {
  const [opened, setOpened] = useState(false)
  const complete = allObjectivesComplete(objectives)

  return (
    <div className="briefing-overlay">
      <div className={`briefing-card ${opened ? 'opened' : 'sealed'}`}>
        {!opened ? (
          <button className="briefing-envelope" onClick={() => setOpened(true)}>
            <span className="briefing-wax">✦</span>
            <span className="briefing-envelope-label">DAILY BRIEFING</span>
            <span className="briefing-envelope-hint">— break seal —</span>
          </button>
        ) : (
          <>
            <div className="briefing-label">
              DAILY BRIEFING{terminalName ? ` · ${terminalName}` : ''}
            </div>
            <ul className="briefing-objectives">
              {objectives.map((o) => (
                <li key={o.id} className={`briefing-objective ${o.done ? 'done' : ''}`}>
                  <span className="briefing-check" aria-hidden="true">{o.done ? '☑' : '☐'}</span>
                  <span className="briefing-objective-label">{o.label}</span>
                  <span className="briefing-objective-count">
                    {o.current}/{o.target}
                  </span>
                </li>
              ))}
            </ul>
            {complete && (
              <p className="briefing-complete">✦ All directives cleared — well done, agent.</p>
            )}
            <button className="briefing-dismiss" onClick={onDismiss}>
              BEGIN →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
