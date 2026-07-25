import { useEffect, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { getFactionsByTheme } from '../db/factionsRepo.js'
import { getFactionDef, rankForReputation } from './factions.js'
import './FactionsScreen.css'

export function FactionsScreen() {
  const theme = useThemeConfig()
  const [factions, setFactions] = useState(null)

  useEffect(() => {
    let cancelled = false
    getFactionsByTheme(theme.id).then((result) => {
      if (!cancelled) setFactions(result)
    })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  if (factions === null) return <p className="empty-state">Loading...</p>
  if (factions.length === 0) {
    return (
      <div className="empty-state-wrap">
        <span className="empty-state-icon" aria-hidden="true">🏳️</span>
        <p className="empty-state">This mainframe has no rival factions to court — yet.</p>
      </div>
    )
  }

  return (
    <div className="faction-list">
      {factions.map((progress) => {
        const def = getFactionDef(progress.factionId)
        if (!def) return null
        const rank = rankForReputation(def.rankNames, progress.reputation)
        const tierSize = 50
        const pct = Math.round(((progress.reputation % tierSize) / tierSize) * 100)

        return (
          <div className="faction-item" key={def.factionId}>
            <div className="faction-item-head">
              <span className="faction-emblem">{def.emblem}</span>
              <span className="faction-name">{def.name}</span>
              <span className="faction-rank">{rank}</span>
            </div>
            <div className="faction-ideology">{def.ideology}</div>
            <div className="faction-bar">
              <div className="faction-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="faction-meta">
              <span>{progress.reputation} REP</span>
              <span>{progress.wordsContributed} words contributed</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
