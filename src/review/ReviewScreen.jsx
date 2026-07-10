import { useEffect, useMemo, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { useAnimatedNumber } from '../components/useAnimatedNumber.js'
import { getDueWords, getRandomWords, reviewWord } from '../db/wordsRepo.js'
import { getProgress, saveProgress } from '../db/progressRepo.js'
import { getSetting } from '../db/settingsRepo.js'
import { awardReputation } from '../db/factionsRepo.js'
import { awardReviewXp, DAILY_QUEST_BONUS_XP, DAILY_QUEST_TARGET } from '../xp/xpService.js'
import { playLevelUpFanfare, playMissSfx, playSuccessSfx } from '../audio/sfx.js'
import { speakTerm } from '../audio/speak.js'
import { playPronunciationSting } from '../audio/themeAudioControl.js'
import { levelProgress, rankForLevel, streakTier } from '../xp/xp.js'
import { resolveTensionVisuals } from '../themes/index.js'
import { findFactionsForTerm } from '../factions/factions.js'
import { findSecretForTerm } from '../secrets/secrets.js'
import { SecretRevealOverlay } from '../secrets/SecretRevealOverlay.jsx'
import { QUALITY } from '../sm2/sm2.js'
import './ReviewScreen.css'

/** Reputation points awarded to each matching faction on a correct recall. */
const FACTION_REPUTATION_PER_CORRECT = 10

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
  const [levelUpInfo, setLevelUpInfo] = useState(null)
  const [flickerKey, setFlickerKey] = useState(0)
  const [shake, setShake] = useState(false)
  const [tension, setTension] = useState(0)
  const [combo, setCombo] = useState(0)
  const [factionToast, setFactionToast] = useState(null)
  const [secretReveal, setSecretReveal] = useState(null)
  const [legionScatter, setLegionScatter] = useState(false)
  const [scatterCount, setScatterCount] = useState(0)
  const [eraWipe, setEraWipe] = useState(false)
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
    setLevelUpInfo(null)
    setFactionToast(null)
    setSecretReveal(null)
    getRandomWords(theme.id, current.id, 2).then((distractors) => {
      const opts = shuffle([
        { label: current.translation || '(no translation)', isCorrect: true },
        ...distractors.map((d) => ({ label: d.translation || '—', isCorrect: false })),
      ])
      setOptions(opts)
    })
    getSetting('autoSpeakEnabled', true).then((enabled) => {
      if (enabled) speakTerm(current.term, theme.sourceLanguageCode)
    })
    getSetting('soundscapeEnabled', true).then((enabled) => {
      if (enabled) playPronunciationSting(theme.id)
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

    let finalProgress = nextProgress
    if (correct) {
      const matchedFactions = findFactionsForTerm(theme.id, current.term)
      if (matchedFactions.length > 0) {
        await Promise.all(
          matchedFactions.map((f) => awardReputation(f.factionId, theme.id, FACTION_REPUTATION_PER_CORRECT))
        )
        setFactionToast(matchedFactions[0])
      }

      const secret = findSecretForTerm(theme.id, current.term)
      if (secret && !nextProgress.secretsUnlocked.includes(secret.term)) {
        finalProgress = await saveProgress(theme.id, {
          secretsUnlocked: [...nextProgress.secretsUnlocked, secret.term],
        })
        setSecretReveal(secret)
      }
    }

    const nextTension = hasTension
      ? correct
        ? Math.max(0, tension - 1)
        : Math.min(3, tension + 1)
      : 0
    const nextCombo = correct ? combo + 1 : 0

    const sfxOn = await getSetting('sfxEnabled', true)
    if (sfxOn) {
      if (correct) playSuccessSfx(theme.audio.sfxVariant, nextCombo)
      else playMissSfx(theme.audio.sfxVariant, nextTension)
    }
    if (!correct) {
      setFlickerKey((k) => k + 1)
      setShake(true)
      setTimeout(() => setShake(false), 1000)
    }
    if (hasTension) setTension(nextTension)

    if (theme.id === 'italian') {
      if (!correct && combo > 0) {
        setScatterCount(combo)
        setLegionScatter(true)
        setTimeout(() => setLegionScatter(false), 650)
      } else {
        setLegionScatter(false)
      }
    }
    setCombo(nextCombo)

    setProgress(finalProgress)
    setXpToast(xpGained > 0 ? `+${xpGained} XP` : '')
    setBadgeToast(newBadges.length > 0 ? newBadges[0] : null)
    setQuestToast(dailyQuest.justCompleted)

    if (leveledUp) {
      setLevelUpInfo({ level: nextProgress.level, rank: rankForLevel(theme.rankNames, nextProgress.level) })
      if (sfxOn) playLevelUpFanfare()
      if (theme.id === 'italian' && theme.stages?.some((s) => s.minLevel === nextProgress.level)) {
        setEraWipe(true)
        setTimeout(() => setEraWipe(false), 1500)
      }
    }
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
    setLevelUpInfo(null)
    setFactionToast(null)
    setSecretReveal(null)
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
    return <p className="empty-state">Loading...</p>
  }

  if (queue.length === 0) {
    return (
      <p className="empty-state">
        No words due for review. Select a word on any page and right-click to archive it.
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
        '--tension-drop': `${tension * 3}px`,
        '--torch-duration': `${Math.max(1.6, 6 - tension * 1.3)}s`,
        transition: 'color 0.5s ease',
      }
    : undefined

  return (
    <div
      className={`review-wrap ${hasTension ? `tension-${tension}` : ''} ${shake ? 'shake-glitch' : ''}`}
      data-theme={theme.id}
      style={tensionStyle}
    >
      {secretReveal && <SecretRevealOverlay secret={secretReveal} onDismiss={() => setSecretReveal(null)} />}
      {eraWipe && <div className="era-wipe" aria-hidden="true" />}

      <div className="review-stats">
        <span className="stat-rank">⚑ {rank}</span>
        <span className={`stat-streak tier-${streakTier(progress.streak)}`}>
          🔥 <span key={progress.streak} className="streak-number">{progress.streak}</span>
        </span>
        <span className="stat-xp">{animatedXp} XP</span>
      </div>

      <div className="level-row">
        <div className="level-bar">
          <div className="level-bar-fill" style={{ width: `${barPct}%` }} />
        </div>
        <div className="quest-pips" title={`Daily quest: ${dailyQuestCount}/${DAILY_QUEST_TARGET}`}>
          {Array.from({ length: DAILY_QUEST_TARGET }).map((_, i) => (
            <span key={i} className={`pip ${i < dailyQuestCount ? 'filled' : ''}`} />
          ))}
        </div>
      </div>

      <div
        className={`term-card ${flickerKey > 0 ? 'fx-error-flicker' : ''} ${isAnswered ? 'is-answered' : ''} ${
          isAnswered && !isCorrect && theme.id === 'russian' ? 'redact' : ''
        } ${isAnswered && !isCorrect && theme.id === 'french' && tension >= 3 ? 'tribunal-sweep' : ''}`}
        key={`${current.id}-${flickerKey}`}
      >
        {theme.id === 'portuguese' && (
          <div
            className={`candle-glow ${isAnswered && !isCorrect ? 'gutter' : ''}`}
            style={{
              opacity: Math.min(0.15 + combo * 0.05, 0.5),
              transform: `scale(${1 + Math.min(combo, 6) * 0.06})`,
            }}
            aria-hidden="true"
          />
        )}
        {theme.id === 'portuguese' && (
          <div
            className={`compass-needle ${isAnswered ? (isCorrect ? 'true-north' : 'astray') : ''}`}
            aria-hidden="true"
          >
            🧭
          </div>
        )}
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
            onClick={() => {
              speakTerm(current.term, theme.sourceLanguageCode)
              getSetting('soundscapeEnabled', true).then((enabled) => {
                if (enabled) playPronunciationSting(theme.id)
              })
            }}
            title="Listen to pronunciation again"
          >
            🔊
          </button>
        </div>
        {current.transliteration && <div className="term-translit">[ {current.transliteration} ]</div>}
        {theme.id === 'italian' && (combo > 0 || legionScatter) && (
          <div className={`legion-column ${legionScatter ? 'scatter' : ''}`} aria-hidden="true">
            {Array.from({ length: Math.min(legionScatter ? scatterCount : combo, 10) }).map((_, i) => (
              <span
                key={i}
                className="legion-glyph"
                style={{
                  animationDelay: `${i * 55}ms`,
                  '--scatter-x': `${(i % 2 === 0 ? 1 : -1) * (18 + i * 5)}px`,
                }}
              >
                🛡
              </span>
            ))}
          </div>
        )}
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

      {isAnswered && levelUpInfo && (
        <div className="level-up-banner">
          <span className="level-up-confetti" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`confetti-bit c${i}`} />
            ))}
          </span>
          <div className="level-up-text">LEVEL {levelUpInfo.level}!</div>
          <div className="level-up-rank">{levelUpInfo.rank}</div>
        </div>
      )}

      {isAnswered && (
        <div className={`result-panel ${isCorrect ? 'correct' : 'wrong'}`}>
          <div className={`result-stamp ${isCorrect && combo >= 3 ? 'combo' : ''}`}>
            {isCorrect ? theme.stampSuccessWord : theme.stampFailWord}
          </div>
          <div className="result-flavor">
            {isCorrect ? theme.stampSuccessFlavor : theme.stampFailFlavor}
            {xpToast && <span className="result-xp"> {xpToast}</span>}
          </div>

          {(badgeToast || questToast || factionToast || (isCorrect && combo >= 3)) && (
            <div className="result-extras">
              {isCorrect && combo >= 3 && <span className="result-chip combo-chip">🔥 Combo x{combo}</span>}
              {badgeToast && (
                <span className="result-chip">
                  {badgeToast.icon} {badgeToast.name}
                </span>
              )}
              {questToast && <span className="result-chip">🎯 +{DAILY_QUEST_BONUS_XP} XP</span>}
              {factionToast && (
                <span className="result-chip">
                  {factionToast.emblem} +{FACTION_REPUTATION_PER_CORRECT} {factionToast.name}
                </span>
              )}
            </div>
          )}

          {current.fact && (
            <div className="result-intel archive-note" key={current.id}>
              <div className="result-intel-label">📜 {theme.intelLabel}</div>
              <div className="result-intel-text">{current.fact}</div>
              {current.exampleSentence && (
                <div className="result-example">
                  <span className="result-example-sentence">{current.exampleSentence}</span>
                  <span className="result-example-translation">{current.exampleTranslation}</span>
                </div>
              )}
              {current.philosophyNote && (
                <div className="result-philosophy">🏛 {current.philosophyNote}</div>
              )}
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
