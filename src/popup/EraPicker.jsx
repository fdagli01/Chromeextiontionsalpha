import { useState } from 'react'
import { listThemes } from '../themes/index.js'
import { seedSampleWords } from '../db/seedWords.js'
import './EraPicker.css'

/**
 * First launch: choose an era, and start.
 *
 * This replaced a four-step "how this works" card that explained capture,
 * FSRS, unlocks and secrets in text before the player had done anything —
 * a manual, not an onboarding. Nobody reads a manual, and worse, the
 * player who dismissed it landed on an empty archive reading "No words
 * due for review", because sample words were behind a button in Settings.
 *
 * So: one screen, one decision, no jargon. Picking an era seeds that
 * era's archive, so the very next thing on screen is a real review card
 * rather than an empty desk. Everything else — XP, tension, factions, the
 * cast — teaches itself through consequence, which is faster than prose.
 * @param {{onBegin: (themeId: string) => void}} props
 */
export function EraPicker({ onBegin }) {
  const [seeding, setSeeding] = useState(null)

  async function begin(themeId) {
    if (seeding) return
    setSeeding(themeId)
    try {
      // Seeding before handing control back means the review screen always
      // opens on a card, never on "nothing due".
      await seedSampleWords(themeId)
      await onBegin(themeId)
    } finally {
      setSeeding(null)
    }
  }

  return (
    <div className="era-picker" role="dialog" aria-modal="true" aria-label="Choose your era">
      <div className="era-picker-inner">
        <h1 className="era-picker-title">CHOOSE YOUR ERA</h1>
        <p className="era-picker-sub">
          You are a clerk in an archive. Which one is up to you.
        </p>

        <div className="era-picker-list">
          {listThemes().map((theme) => (
            <button
              key={theme.id}
              className="era-card"
              disabled={!!seeding}
              onClick={() => begin(theme.id)}
              style={{
                '--era-bg': theme.colors.surface,
                '--era-accent': theme.colors.accent,
                '--era-text': theme.colors.text,
                '--era-border': theme.colors.border,
                '--era-heading': theme.fontHeading,
              }}
            >
              <span className="era-emblem" aria-hidden="true">{theme.emblem}</span>
              <span className="era-info">
                <span className="era-name">{theme.terminalName}</span>
                <span className="era-desc">{theme.era}</span>
              </span>
              <span className="era-go" aria-hidden="true">
                {seeding === theme.id ? '…' : '→'}
              </span>
            </button>
          ))}
        </div>

        <p className="era-picker-foot">You can switch eras any time. Progress is kept per era.</p>
      </div>
    </div>
  )
}
