import { useEffect, useState } from 'react'
import { getPersonaById } from '../progression/mentors.js'
import { isTermKnown, resolveSceneChoice } from '../progression/storyScenes.js'
import './StorySceneOverlay.css'

/**
 * A story scene: full-screen interruption with the persona's portrait,
 * their words, and a real choice. Two phases — the ask, then the persona's
 * reaction to what you chose — so the consequence lands as dialogue, not
 * as a toast.
 *
 * Word-gated choices are the SRS-RPG fusion: a third, better line that
 * stays locked until the player has genuinely learned a specific term.
 * Locked options are shown (not hidden) so the story visibly rewards a
 * trip back to the review desk.
 * @param {{themeId: string, scene: import('../progression/storyScenes.js').StoryScene, onClose: (progress: object | null) => void}} props
 */
export function StorySceneOverlay({ themeId, scene, onClose }) {
  const [response, setResponse] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [finalProgress, setFinalProgress] = useState(null)
  const [unlockedTerms, setUnlockedTerms] = useState(null)
  const persona = getPersonaById(themeId, scene.personaId)
  const gatedTerms = scene.choices.filter((c) => c.requiresTerm).map((c) => c.requiresTerm)

  useEffect(() => {
    let cancelled = false
    if (gatedTerms.length === 0) {
      setUnlockedTerms({})
      return
    }
    Promise.all(gatedTerms.map((term) => isTermKnown(themeId, term))).then((results) => {
      if (cancelled) return
      const map = {}
      gatedTerms.forEach((term, i) => {
        map[term] = results[i]
      })
      setUnlockedTerms(map)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, scene.id])

  async function choose(choice) {
    if (resolving || response) return
    if (choice.requiresTerm && !unlockedTerms?.[choice.requiresTerm]) return
    setResolving(true)
    try {
      const outcome = await resolveSceneChoice(themeId, scene, choice)
      setResponse(outcome.response)
      setFinalProgress(outcome.progress)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="story-scene-overlay">
      <div className="story-scene-card">
        <div className="story-scene-label">◈ PERSONAL FILE ◈</div>
        <div className="story-scene-header">
          {persona?.portrait ? (
            <img className="story-scene-portrait" src={persona.portrait} alt="" aria-hidden="true" />
          ) : (
            <span className="story-scene-icon" aria-hidden="true">{persona?.icon}</span>
          )}
          <div>
            <div className="story-scene-persona">{persona?.name ?? scene.personaId}</div>
            <div className="story-scene-title">{scene.title}</div>
          </div>
        </div>

        {!response ? (
          <>
            <p className="story-scene-body">{scene.body}</p>
            <div className="story-scene-choices">
              {scene.choices.map((choice) => {
                const locked = !!choice.requiresTerm && !unlockedTerms?.[choice.requiresTerm]
                return (
                  <button
                    key={choice.id}
                    className={`story-scene-choice-btn${locked ? ' locked' : ''}${choice.requiresTerm && !locked ? ' word-unlocked' : ''}`}
                    disabled={resolving || locked}
                    onClick={() => choose(choice)}
                    title={locked ? `Learn "${choice.requiresTerm}" at the review desk to unlock this.` : undefined}
                  >
                    {locked ? (
                      <>
                        <span className="story-scene-lock" aria-hidden="true">🔒</span> Requires knowledge of "
                        {choice.requiresTerm}"
                      </>
                    ) : (
                      choice.label
                    )}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <p className="story-scene-body story-scene-response">{response}</p>
            <p className="story-scene-journal-note">— recorded in your file. The world remembers.</p>
            <button className="story-scene-continue-btn" onClick={() => onClose(finalProgress)}>
              CONTINUE →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
