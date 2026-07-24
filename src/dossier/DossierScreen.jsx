import { useEffect, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { getDossier } from '../progression/dossier.js'
import './DossierScreen.css'

/**
 * The dossier: the player's own file. Who trusts them, what they chose
 * when it counted, and what still stands between them and their ending.
 * Everything here already happened — this screen is the first place the
 * player can actually read it back.
 */
export function DossierScreen() {
  const theme = useThemeConfig()
  const [data, setData] = useState(null)
  const [openPersona, setOpenPersona] = useState(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    getDossier(theme.id).then((d) => {
      if (!cancelled) setData(d)
    })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  if (!data) return <p className="empty-state">Retrieving file...</p>

  const { rank, level, personas, journal, ending } = data

  return (
    <div className="dossier">
      <div className="dossier-header">
        <div className="dossier-header-label">◈ PERSONAL FILE ◈</div>
        <div className="dossier-rank">{rank}</div>
        <div className="dossier-sub">
          Level {level} · {theme.terminalName}
        </div>
      </div>

      <div className={`dossier-ending ${ending.claimed ? 'claimed' : ''}`}>
        {ending.claimed ? (
          <>
            <div className="dossier-section-title">⬥ FILE CLOSED</div>
            <p className="dossier-ending-note">
              Your story here has an ending, and you earned the one you got.
            </p>
          </>
        ) : (
          <>
            <div className="dossier-section-title">⬥ TO CLOSE THIS FILE</div>
            <ul className="dossier-req-list">
              <li className={ending.needsRank ? '' : 'done'}>
                {ending.needsRank ? `Reach the rank of ${ending.needsRank}` : 'Top rank reached'}
              </li>
              <li className={ending.scenesRemaining === 0 ? 'done' : ''}>
                {ending.scenesRemaining === 0
                  ? 'Every story resolved'
                  : `${ending.scenesRemaining} story ${ending.scenesRemaining === 1 ? 'scene' : 'scenes'} still unresolved`}
              </li>
            </ul>
          </>
        )}
      </div>

      <div className="dossier-section-title">⬥ THE CAST</div>
      <div className="dossier-personas">
        {personas.map((p) => {
          const open = openPersona === p.personaId
          const resolved = p.scenes.filter((s) => s.resolved).length
          return (
            <div key={p.personaId} className={`dossier-persona tier-${p.tier.id}`}>
              <button
                className="dossier-persona-head"
                onClick={() => setOpenPersona(open ? null : p.personaId)}
                aria-expanded={open}
              >
                {p.portrait ? (
                  <img className="dossier-portrait" src={p.portrait} alt="" aria-hidden="true" />
                ) : (
                  <span className="dossier-portrait-icon" aria-hidden="true">{p.icon}</span>
                )}
                <span className="dossier-persona-info">
                  <span className="dossier-persona-name">{p.name}</span>
                  <span className="dossier-persona-tier">
                    {p.tier.label} · trust {p.trust}
                    {p.memento ? ` · ${p.memento.icon}` : ''}
                  </span>
                  <span className="dossier-persona-scenes">
                    {resolved}/{p.scenes.length} stories resolved
                  </span>
                </span>
                <span className="dossier-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
              </button>

              {open && (
                <div className="dossier-persona-body">
                  {p.backstory && <p className="dossier-backstory">{p.backstory}</p>}
                  {p.memento && (
                    <p className="dossier-memento">
                      {p.memento.icon} <strong>{p.memento.name}</strong> — {p.memento.flavor}
                    </p>
                  )}
                  {p.scenes.map((s) => (
                    <div key={s.sceneId} className={`dossier-scene ${s.resolved ? 'resolved' : 'locked'}`}>
                      <div className="dossier-scene-title">
                        {s.resolved ? '✓' : '🔒'} {s.title}
                        <span className="dossier-scene-tier">{s.tier}</span>
                      </div>
                      {s.resolved ? (
                        <>
                          <p className="dossier-scene-choice">You chose: "{s.choiceLabel}"</p>
                          <p className="dossier-scene-response">{s.response}</p>
                        </>
                      ) : (
                        <p className="dossier-scene-choice muted">
                          Unlocks at {s.tier === 'warm' ? 'Warm' : 'Ally'} trust.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="dossier-section-title">⬥ THE RECORD</div>
      {journal.length === 0 ? (
        <p className="dossier-empty">
          Nothing on record yet. Choices made in story scenes are filed here permanently.
        </p>
      ) : (
        <ol className="dossier-journal">
          {journal.map((entry) => (
            <li key={entry.id} className="dossier-journal-entry">
              <span className="dossier-journal-label">{entry.label}</span>
              <span className="dossier-journal-date">{entry.at.slice(0, 10)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
