import { useState } from 'react'
import { getPersonaById } from '../progression/mentors.js'
import { resolveSceneChoice } from '../progression/storyScenes.js'
import './StorySceneOverlay.css'

/**
 * A story scene: full-screen interruption with the persona's portrait,
 * their words, and a real choice. Two phases — the ask, then the persona's
 * reaction to what you chose — so the consequence lands as dialogue, not
 * as a toast.
 * @param {{themeId: string, scene: import('../progression/storyScenes.js').StoryScene, onClose: (progress: object | null) => void}} props
 */
export function StorySceneOverlay({ themeId, scene, onClose }) {
  const [response, setResponse] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [finalProgress, setFinalProgress] = useState(null)
  const persona = getPersonaById(themeId, scene.personaId)

  async function choose(choice) {
    if (resolving || response) return
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
              {scene.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="story-scene-choice-btn"
                  disabled={resolving}
                  onClick={() => choose(choice)}
                >
                  {choice.label}
                </button>
              ))}
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
