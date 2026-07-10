import { useEffect, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { getWordsByTheme } from '../db/wordsRepo.js'
import { getSetting } from '../db/settingsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { speakTerm } from '../audio/speak.js'
import { playPronunciationSting } from '../audio/themeAudioControl.js'
import { getSecretsForTheme } from '../secrets/secrets.js'
import './ArchiveScreen.css'

export function ArchiveScreen() {
  const theme = useThemeConfig()
  const [words, setWords] = useState(null)
  const [secretsUnlocked, setSecretsUnlocked] = useState([])

  useEffect(() => {
    let cancelled = false
    getWordsByTheme(theme.id).then((result) => {
      if (!cancelled) setWords(result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    })
    getProgress(theme.id).then((progress) => {
      if (!cancelled) setSecretsUnlocked(progress.secretsUnlocked)
    })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  function playPronunciation(term) {
    speakTerm(term, theme.sourceLanguageCode)
    getSetting('soundscapeEnabled', true).then((enabled) => {
      if (enabled) playPronunciationSting(theme.id)
    })
  }

  if (words === null) return <p className="empty-state">Loading...</p>

  const allSecrets = getSecretsForTheme(theme.id)
  const secretsSection =
    allSecrets.length > 0 ? (
      <div className="archive-secrets">
        <div className="archive-secrets-head">
          🔍 Secrets Discovered ({secretsUnlocked.length}/{allSecrets.length})
        </div>
        {secretsUnlocked.length > 0 && (
          <div className="archive-secrets-list">
            {allSecrets
              .filter((s) => secretsUnlocked.includes(s.term))
              .map((s) => (
                <div className="archive-secret-item" key={s.term}>
                  <div className="archive-secret-title">
                    {s.icon} {s.title}
                  </div>
                  <div className="archive-secret-anecdote">{s.anecdote}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    ) : null

  if (words.length === 0)
    return (
      <>
        {secretsSection}
        <p className="empty-state">
          Your archive is still empty. Select a word on any page and right-click to add it.
        </p>
      </>
    )

  return (
    <div className="archive-list">
      {secretsSection}
      {words.map((word) => (
        <div className="archive-item" key={word.id}>
          <div className="archive-item-head">
            <button
              className="archive-term-button"
              onClick={() => playPronunciation(word.term)}
              title="Listen to pronunciation"
            >
              🔊 {word.term}
            </button>
            <span className="archive-translation">{word.translation || '(no translation)'}</span>
            {word.struggling && theme.strugglingLabel && (
              <span className="archive-struggling">{theme.strugglingLabel}</span>
            )}
          </div>
          {word.transliteration && <div className="archive-translit">[ {word.transliteration} ]</div>}
          {word.fact && <div className="archive-fact">{word.fact}</div>}
          {word.exampleSentence && (
            <div className="archive-example">
              <span className="archive-example-sentence">{word.exampleSentence}</span>
              <span className="archive-example-translation">{word.exampleTranslation}</span>
            </div>
          )}
          {word.philosophyNote && <div className="archive-philosophy">🏛 {word.philosophyNote}</div>}
          {word.etymology && (
            <div className="archive-etymology">
              <div className="archive-etymology-head">🔎 {word.etymology.rootLanguage}</div>
              <div>{word.etymology.origin}</div>
              <div>{word.etymology.evolution}</div>
              <div className="archive-etymology-tie">{word.etymology.thematicTie}</div>
            </div>
          )}
          <div className="archive-meta">
            <span>
              <span className="meta-label">REP:</span> {word.repetition}
            </span>
            <span>
              <span className="meta-label">EF:</span> {word.easeFactor.toFixed(2)}
            </span>
            <span>
              <span className="meta-label">INT:</span> {word.interval}d
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
