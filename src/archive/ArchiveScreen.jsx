import { useEffect, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { getWordsByTheme } from '../db/wordsRepo.js'
import { speakTerm } from '../audio/speak.js'
import './ArchiveScreen.css'

export function ArchiveScreen() {
  const theme = useThemeConfig()
  const [words, setWords] = useState(null)

  useEffect(() => {
    let cancelled = false
    getWordsByTheme(theme.id).then((result) => {
      if (!cancelled) setWords(result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  if (words === null) return <p className="empty-state">Yükleniyor...</p>
  if (words.length === 0)
    return (
      <p className="empty-state">
        Arşivin henüz boş. Bir sayfada kelime seçip sağ tıklayarak ekle.
      </p>
    )

  return (
    <div className="archive-list">
      {words.map((word) => (
        <div className="archive-item" key={word.id}>
          <div className="archive-item-head">
            <button
              className="archive-term-button"
              onClick={() => speakTerm(word.term, theme.sourceLanguageCode)}
              title="Telaffuzu dinle"
            >
              🔊 {word.term}
            </button>
            <span className="archive-translation">{word.translation || '(çeviri yok)'}</span>
            {word.struggling && theme.strugglingLabel && (
              <span className="archive-struggling">{theme.strugglingLabel}</span>
            )}
          </div>
          {word.transliteration && <div className="archive-translit">[ {word.transliteration} ]</div>}
          {word.fact && <div className="archive-fact">{word.fact}</div>}
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
