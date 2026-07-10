import { useEffect, useMemo, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { useAnimatedNumber } from '../components/useAnimatedNumber.js'
import { getDueWords, getRandomWords, reviewWord } from '../db/wordsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { getSetting } from '../db/settingsRepo.js'
import { awardReviewXp, DAILY_QUEST_BONUS_XP, DAILY_QUEST_TARGET } from '../xp/xpService.js'
import { playMissSfx, playSuccessSfx } from '../audio/sfx.js'
import { speakTerm } from '../audio/speak.js'
import { levelProgress, rankForLevel, streakTier } from '../xp/xp.js'
import { resolveTensionVisuals } from '../themes/index.js'
import { QUALITY } from '../sm2/sm2.js'
import './ReviewScreen.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ReviewScreen() {
  const theme = useThemeConfig()
  const [queue, setQueue] = useState(null)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(null)
  const [xpToast, setXpToast] = useState('')
  const [badgeToast, setBadgeToast] = useState(null)
  const [questToast, setQuestToast] = useState(false)
  const [flickerKey, setFlickerKey] = useState(0)
  const [tension, setTension] = useState(0)
  const [combo, setCombo] = useState(0)
  const hasTension = theme.tensionLevels.length > 0
  const tensionVisuals = useMemo(() => resolveTensionVisuals(theme, tension), [theme, tension])

  useEffect(() => {
    let cancelled = false
    Promise.all([getDueWords(theme.id), getProgress(theme.id)]).then(([words, prog]) => {
      if (cancelled) return
      setQueue(words)
      setProgress(prog)
    })
    setTension(0)
    setCombo(0)
    return () => {
      cancelled = true
    }
  }, [theme.id])

  const current = queue?.[0]

  useEffect(() => {
    if (!current) return
    setSelected(null)
    setXpToast('')
    setBadgeToast(null)
    setQuestToast(false)
    getRandomWords(theme.id, current.id, 2).then((distractors) => {
      const opts = shuffle([
        { label: current.translation || '(çeviri yok)', isCorrect: true },
        ...distractors.map((d) => ({ label: d.translation || '—', isCorrect: false })),
      ])
      setOptions(opts)
    })
    getSetting('autoSpeakEnabled', true).then((enabled) => {
      if (enabled) speakTerm(current.term, theme.sourceLanguageCode)
    })
  }, [current?.id, theme.id])

  const animatedXp = useAnimatedNumber(progress?.xp ?? 0)
  const isAnswered = selected !== null

  async function pick(index) {
    if (isAnswered || !options[index]) return
    setSelected(index)
    const correct = options[index].isCorrect
    const quality = correct ? QUALITY.GOOD : QUALITY.AGAIN

    await reviewWord(current.id, quality)
    const { progress: nextProgress, xpGained, leveledUp, newBadges, dailyQuest } = await awardReviewXp(
      theme.id,
      quality
    )

    const nextTension = hasTension
      ? correct
        ? Math.max(0, tension - 1)
        : Math.min(3, tension + 1)
      : 0
    const nextCombo = correct ? combo + 1 : 0

    if (await getSetting('sfxEnabled', true)) {
      if (correct) playSuccessSfx(theme.audio.sfxVariant, nextCombo)
      else playMissSfx(theme.audio.sfxVariant, nextTension)
    }
    if (!correct) setFlickerKey((k) => k + 1)
    if (hasTension) setTension(nextTension)
    setCombo(nextCombo)

    setProgress(nextProgress)
    setXpToast(xpGained > 0 ? `+${xpGained} XP${leveledUp ? ` — SEVİYE ${nextProgress.level}!` : ''}` : '')
    setBadgeToast(newBadges.length > 0 ? newBadges[0] : null)
    setQuestToast(dailyQuest.justCompleted)
  }

  function nextWord() {
    const wasCorrect = options[selected]?.isCorrect
    const rest = queue.slice(1)
    setQueue(
      !wasCorrect
        ? [...rest, { ...current, dueDate: new Date().toISOString(), struggling: true }]
        : rest
    )
    setSelected(null)
    setXpToast('')
    setBadgeToast(null)
    setQuestToast(false)
  }

  // Interrogation-room keyboard protocol: 1/2/3 pick an answer, Enter advances.
  useEffect(() => {
    if (!current) return
    function onKeyDown(e) {
      if (!isAnswered) {
        const index = Number.parseInt(e.key, 10) - 1
        if (index >= 0 && index < options.length) {
          e.preventDefault()
          pick(index)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        nextWord()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (queue === null || progress === null) {
    return <p className="empty-state">Yükleniyor...</p>
  }

  if (queue.length === 0) {
    return (
      <p className="empty-state">
        Tekrar edilecek kelime yok. Bir sayfada kelime seçip sağ tıklayarak arşivine ekle.
      </p>
    )
  }

  const { level, xpIntoLevel, xpToNextLevel } = levelProgress(progress.xp)
  const rank = rankForLevel(theme.rankNames, level)
  const barPct = xpToNextLevel > 0 ? Math.round((xpIntoLevel / xpToNextLevel) * 100) : 100
  const isCorrect = isAnswered && options[selected]?.isCorrect
  const today = new Date().toISOString().slice(0, 10)
  const dailyQuestCount = Math.min(
    progress.dailyQuestDate === today ? progress.dailyReviewCount : 0,
    DAILY_QUEST_TARGET
  )

  const tensionStyle = hasTension
    ? {
        '--color-background': tensionVisuals.colors.background,
        '--color-surface': tensionVisuals.colors.surface,
        '--color-surface-strong': tensionVisuals.colors.surfaceStrong,
        '--color-primary': tensionVisuals.colors.primary,
        '--color-accent': tensionVisuals.colors.accent,
        '--color-text': tensionVisuals.colors.text,
        '--color-text-muted': tensionVisuals.colors.textMuted,
        '--color-border': tensionVisuals.colors.border,
        '--color-danger': tensionVisuals.colors.danger,
        '--color-success': tensionVisuals.colors.success,
        '--font-heading': tensionVisuals.fontHeading,
        transition: 'color 0.5s ease',
      }
    : undefined

  return (
    <div
      className={`review-wrap ${hasTension ? `tension-${tension}` : ''}`}
      style={tensionStyle}
    >
      <div className="review-stats">
        <span className="stat-rank">⚑ {rank}</span>
        <span className={`stat-streak tier-${streakTier(progress.streak)}`}>🔥 {progress.streak}</span>
        <span className="stat-xp">{animatedXp} XP</span>
      </div>

      <div className="level-row">
        <div className="level-bar">
          <div className="level-bar-fill" style={{ width: `${barPct}%` }} />
        </div>
        <div className="quest-pips" title={`Günlük görev: ${dailyQuestCount}/${DAILY_QUEST_TARGET}`}>
          {Array.from({ length: DAILY_QUEST_TARGET }).map((_, i) => (
            <span key={i} className={`pip ${i < dailyQuestCount ? 'filled' : ''}`} />
          ))}
        </div>
      </div>

      <div className={`term-card ${flickerKey > 0 ? 'fx-error-flicker' : ''}`} key={flickerKey}>
        <div className="term-eyebrow">
          {theme.eyebrowLabel}
          {current.struggling && theme.strugglingLabel && (
            <span className="struggling-tag">{theme.strugglingLabel}</span>
          )}
        </div>
        <div className="term-word">
          {current.term}
          <button
            className="term-speak-btn"
            onClick={() => speakTerm(current.term, theme.sourceLanguageCode)}
            title="Telaffuzu tekrar dinle"
          >
            🔊
          </button>
        </div>
        {current.transliteration && <div className="term-translit">[ {current.transliteration} ]</div>}
      </div>

      <div className="options-list">
        {options.map((opt, i) => {
          if (isAnswered && !opt.isCorrect && i !== selected) return null
          const cls = `option-btn${isAnswered ? (opt.isCorrect ? ' correct' : ' wrong') : ''}`
          return (
            <button key={i} className={cls} onClick={() => pick(i)}>
              <span className="option-num">[{i + 1}]</span>
              <span className="option-label">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div className={`result-panel ${isCorrect ? 'correct' : 'wrong'}`}>
          <div className={`result-stamp ${isCorrect && combo >= 3 ? 'combo' : ''}`}>
            {isCorrect ? theme.stampSuccessWord : theme.stampFailWord}
          </div>
          <div className="result-flavor">
            {isCorrect ? theme.stampSuccessFlavor : theme.stampFailFlavor}
            {xpToast && <span className="result-xp"> {xpToast}</span>}
          </div>

          {(badgeToast || questToast || (isCorrect && combo >= 3)) && (
            <div className="result-extras">
              {isCorrect && combo >= 3 && <span className="result-chip combo-chip">🔥 Combo x{combo}</span>}
              {badgeToast && (
                <span className="result-chip">
                  {badgeToast.icon} {badgeToast.name}
                </span>
              )}
              {questToast && <span className="result-chip">🎯 +{DAILY_QUEST_BONUS_XP} XP</span>}
            </div>
          )}

          {current.fact && (
            <div className="result-intel">
              <div className="result-intel-label">{theme.intelLabel}</div>
              <div className="result-intel-text">{current.fact}</div>
            </div>
          )}
        </div>
      )}

      {isAnswered && (
        <button className="next-btn" onClick={nextWord}>
          {theme.nextButtonLabel}
        </button>
      )}
    </div>
  )
}
