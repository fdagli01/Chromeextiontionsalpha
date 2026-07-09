import { useEffect, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { useAnimatedNumber } from '../components/useAnimatedNumber.js'
import { Typewriter } from '../components/Typewriter.jsx'
import { getDueWords, reviewWord } from '../db/wordsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { getSetting } from '../db/settingsRepo.js'
import { awardReviewXp } from '../xp/xpService.js'
import { playStamp, playSoftMiss } from '../audio/sfx.js'
import { levelProgress, rankForLevel } from '../xp/xp.js'
import { QUALITY } from '../sm2/sm2.js'
import './ReviewScreen.css'

const GRADE_BUTTONS = [
  { quality: QUALITY.AGAIN, label: 'Tekrar', className: 'again' },
  { quality: QUALITY.HARD, label: 'Zor', className: 'hard' },
  { quality: QUALITY.GOOD, label: 'İyi', className: 'good' },
  { quality: QUALITY.EASY, label: 'Kolay', className: 'easy' },
]

export function ReviewScreen() {
  const theme = useThemeConfig()
  const [queue, setQueue] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [progress, setProgress] = useState(null)
  const [xpToast, setXpToast] = useState('')
  const [stamp, setStamp] = useState(null)
  const [flickerKey, setFlickerKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([getDueWords(theme.id), getProgress(theme.id)]).then(([words, prog]) => {
      if (cancelled) return
      setQueue(words)
      setProgress(prog)
    })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  const animatedXp = useAnimatedNumber(progress?.xp ?? 0)

  if (queue === null || progress === null) {
    return <p className="empty-state">Yükleniyor...</p>
  }

  if (queue.length === 0) {
    return <p className="empty-state">Tekrar edilecek kelime yok. Bir sayfada kelime seçip sağ tıklayarak arşivine ekle.</p>
  }

  const current = queue[0]
  const { level, xpIntoLevel, xpToNextLevel } = levelProgress(progress.xp)
  const rank = rankForLevel(theme.rankNames, level)
  const barPct = xpToNextLevel > 0 ? Math.round((xpIntoLevel / xpToNextLevel) * 100) : 100

  async function grade(quality) {
    await reviewWord(current.id, quality)
    const { progress: nextProgress, xpGained, leveledUp } = await awardReviewXp(theme.id, quality)
    const success = quality >= 3

    if (await getSetting('sfxEnabled', true)) {
      if (success) playStamp()
      else playSoftMiss()
    }
    setStamp({ type: success ? 'success' : 'miss', key: Date.now() })
    if (!success) setFlickerKey((k) => k + 1)

    setProgress(nextProgress)
    setXpToast(
      xpGained > 0
        ? `+${xpGained} XP${leveledUp ? ` — Seviye ${nextProgress.level}!` : ''}`
        : 'Tekrar öncelikli listeye alındı'
    )

    const rest = queue.slice(1)
    setQueue(quality < 3 ? [...rest, { ...current, dueDate: new Date().toISOString() }] : rest)
    setRevealed(false)
  }

  return (
    <div>
      <div className="review-header">
        <span className="rank">{rank}</span>
        <span>{animatedXp} XP</span>
        <span className="streak">🔥 {progress.streak}</span>
      </div>
      <div className="level-bar">
        <div className="level-bar-fill" style={{ width: `${barPct}%` }} />
      </div>

      <div className={`review-card ${flickerKey > 0 ? 'fx-flicker' : ''}`} key={flickerKey}>
        {stamp && (
          <div className={`stamp-mark ${stamp.type}`} key={stamp.key}>
            {stamp.type === 'success' ? 'Одобрено' : 'Отказано'}
          </div>
        )}
        <div className="term">{current.term}</div>
        {revealed && (
          <>
            <div className="translation">{current.translation || '(çeviri yok)'}</div>
            {current.fact && (
              <div className="fact">
                <Typewriter text={current.fact} />
              </div>
            )}
          </>
        )}
      </div>

      {!revealed ? (
        <button className="reveal-button" onClick={() => setRevealed(true)}>
          Göster
        </button>
      ) : (
        <div className="grade-buttons">
          {GRADE_BUTTONS.map((btn) => (
            <button key={btn.quality} className={btn.className} onClick={() => grade(btn.quality)}>
              {btn.label}
            </button>
          ))}
        </div>
      )}

      <div className="xp-toast">{xpToast}</div>
    </div>
  )
}
