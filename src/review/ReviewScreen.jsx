import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { useAnimatedNumber } from '../components/useAnimatedNumber.js'
import { getColdCaseWords, getDueWords, getFreePracticeWords, getRandomWords, reviewWord } from '../db/wordsRepo.js'
import { getProgress, saveProgress } from '../db/progressRepo.js'
import { getSetting } from '../db/settingsRepo.js'
import { awardReputation, getFactionProgress } from '../db/factionsRepo.js'
import { logReviewActivity } from '../db/activityLog.js'
import { awardBonusXp, awardReviewXp, DAILY_QUEST_BONUS_XP, DAILY_QUEST_TARGET } from '../xp/xpService.js'
import { isUnlocked, nextFeatureUnlock } from '../progression/unlocks.js'
import { getActiveWorldEvent, worldEventMultiplier } from '../progression/worldEvents.js'
import { rollInterceptEvent } from '../progression/randomEvents.js'
import { isReverseDay } from './reverseMode.js'
import {
  playBadgeUnlock,
  playComboMilestone,
  playFactionPromotion,
  playLevelUpFanfare,
  playMissSfx,
  playQuestComplete,
  playSessionComplete,
  playStreakTierUp,
  playSuccessSfx,
} from '../audio/sfx.js'
import { speakTerm } from '../audio/speak.js'
import { playPronunciationSting } from '../audio/themeAudioControl.js'
import { comboMeterFill, comboMultiplier, levelProgress, rankForLevel, streakTier } from '../xp/xp.js'
import { resolveTensionVisuals, resolveThemeStage } from '../themes/index.js'
import { findFactionsForTerm, rankForReputation } from '../factions/factions.js'
import { findSecretForTerm } from '../secrets/secrets.js'
import { SecretRevealOverlay } from '../secrets/SecretRevealOverlay.jsx'
import { QUALITY } from '../srs/fsrs.js'
import './ReviewScreen.css'

/** Reputation points awarded to each matching faction on a correct recall. */
const FACTION_REPUTATION_PER_CORRECT = 10

/** Response-time thresholds (ms) used to derive Easy/Hard from a correct answer. */
const FAST_ANSWER_MS = 3000
const SLOW_ANSWER_MS = 8000

/** Consecutive-correct combo count that triggers a milestone sting. */
const COMBO_MILESTONE_STEP = 5

/**
 * Per-theme glyph for the marching streak column: it tracks the current
 * combo as a row of icons that break formation and scatter the instant the
 * streak is lost. Only themes listed here get the column at all — the
 * other themes already have their own distinct card-level motif (Russian's
 * redaction bars, Portuguese's candle/compass, French's tribunal sweep).
 */
const STREAK_GLYPHS = {
  italian: '🛡',
  spanish: '✊',
}

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
  const [shieldToast, setShieldToast] = useState(false)
  const [interceptToast, setInterceptToast] = useState(null)
  const [levelUpInfo, setLevelUpInfo] = useState(null)
  const [flickerKey, setFlickerKey] = useState(0)
  const [shake, setShake] = useState(false)
  const [tension, setTension] = useState(0)
  const [combo, setCombo] = useState(0)
  const [factionToast, setFactionToast] = useState(null)
  const [promotionCeremony, setPromotionCeremony] = useState(null)
  const [doubleAgentChoice, setDoubleAgentChoice] = useState(null)
  const [secretReveal, setSecretReveal] = useState(null)
  const [streakScatter, setStreakScatter] = useState(false)
  const [scatterCount, setScatterCount] = useState(0)
  const [eraWipe, setEraWipe] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    xpGained: 0,
    bestCombo: 0,
    badgesEarned: 0,
    questCompleted: false,
  })
  const [coldCaseWords, setColdCaseWords] = useState([])
  const [coldCaseSession, setColdCaseSession] = useState(false)
  const sessionCompleteAnnouncedRef = useRef(false)
  const shownAtRef = useRef(performance.now())
  const hasTension = theme.tensionLevels.length > 0
  const tensionVisuals = useMemo(() => resolveTensionVisuals(theme, tension), [theme, tension])
  const reverseMode = useMemo(() => isReverseDay(), [])
  const worldEvent = useMemo(() => getActiveWorldEvent(), [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getDueWords(theme.id), getProgress(theme.id), getColdCaseWords(theme.id)]).then(
      ([words, prog, coldCases]) => {
        if (cancelled) return
        setQueue(words)
        setProgress(prog)
        setColdCaseWords(coldCases)
      }
    )
    setTension(0)
    setCombo(0)
    setColdCaseSession(false)
    setSessionStats({ reviewed: 0, correct: 0, xpGained: 0, bestCombo: 0, badgesEarned: 0, questCompleted: false })
    sessionCompleteAnnouncedRef.current = false
    return () => {
      cancelled = true
    }
  }, [theme.id])

  /** Starts a focused mini-session over just the most-neglected due words, at double XP. */
  function startColdCaseSession() {
    setQueue(coldCaseWords)
    setColdCaseSession(true)
    setCombo(0)
    setSessionStats({ reviewed: 0, correct: 0, xpGained: 0, bestCombo: 0, badgesEarned: 0, questCompleted: false })
    sessionCompleteAnnouncedRef.current = false
  }

  /** Starts an on-demand practice session over any words, ignoring dueDate entirely. */
  function startFreePractice() {
    getFreePracticeWords(theme.id).then((words) => {
      setQueue(words)
      setColdCaseSession(false)
      setCombo(0)
      setSessionStats({ reviewed: 0, correct: 0, xpGained: 0, bestCombo: 0, badgesEarned: 0, questCompleted: false })
      sessionCompleteAnnouncedRef.current = false
    })
  }

  const current = queue?.[0]

  useEffect(() => {
    if (!current) return
    setSelected(null)
    setXpToast('')
    setBadgeToast(null)
    setQuestToast(false)
    setShieldToast(false)
    setInterceptToast(null)
    setLevelUpInfo(null)
    setFactionToast(null)
    setSecretReveal(null)
    shownAtRef.current = performance.now()
    getRandomWords(theme.id, current.id, 2).then((distractors) => {
      const opts = reverseMode
        ? shuffle([
            { label: current.term, translit: current.transliteration, isCorrect: true },
            ...distractors.map((d) => ({ label: d.term, translit: d.transliteration, isCorrect: false })),
          ])
        : shuffle([
            { label: current.translation || '(no translation)', isCorrect: true },
            ...distractors.map((d) => ({ label: d.translation || '—', isCorrect: false })),
          ])
      setOptions(opts)
    })
    // Auto-speaking the term before the player has answered would hand them
    // the answer on a reverse day, since the term is what they're picking.
    if (!reverseMode) {
      getSetting('autoSpeakEnabled', true).then((enabled) => {
        if (enabled) speakTerm(current.term, theme.sourceLanguageCode)
      })
    }
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
    const elapsedMs = performance.now() - shownAtRef.current
    const quality = !correct
      ? QUALITY.AGAIN
      : elapsedMs < FAST_ANSWER_MS
        ? QUALITY.EASY
        : elapsedMs > SLOW_ANSWER_MS
          ? QUALITY.HARD
          : QUALITY.GOOD

    // Momentum: the answer that lands on (or extends past) a combo tier is
    // rewarded at that tier's multiplier, so a running streak visibly pays
    // more per correct answer. A miss resets the combo and the bonus.
    const nextCombo = correct ? combo + 1 : 0
    const momentumMultiplier = correct ? comboMultiplier(nextCombo) : 1
    // A world event's XP boost stacks on top of the momentum multiplier, so a
    // hot combo on a Double Dispatch weekend pays out especially well.
    const totalMultiplier = momentumMultiplier * worldEventMultiplier(worldEvent)

    await reviewWord(current.id, quality)
    logReviewActivity(current.term, correct)
    let { progress: nextProgress, xpGained, leveledUp, streakShieldUsed, newBadges, dailyQuest } =
      await awardReviewXp(theme.id, quality, { multiplier: totalMultiplier, combo: nextCombo })

    // Cold case sessions run at double XP — the whole point is to make
    // rescuing a near-forgotten word worth more than a routine review.
    if (coldCaseSession && xpGained > 0) {
      const bonus = await awardBonusXp(theme.id, xpGained)
      xpGained *= 2
      nextProgress = bonus.progress
      leveledUp = leveledUp || bonus.leveledUp
      newBadges = [...newBadges, ...bonus.newBadges]
    }

    let finalProgress = nextProgress
    let factionPromoted = false
    if (correct) {
      const matchedFactions = findFactionsForTerm(theme.id, current.term)
      if (matchedFactions.length > 1 && isUnlocked('factions', nextProgress.level)) {
        // A word two rival factions both want — hold reputation until the
        // player picks who to report it to, instead of quietly feeding both.
        setDoubleAgentChoice({ term: current.term, factions: matchedFactions })
      } else if (matchedFactions.length > 0) {
        const beforeReps = await Promise.all(
          matchedFactions.map((f) => getFactionProgress(f.factionId, theme.id))
        )
        const afterReps = await Promise.all(
          matchedFactions.map((f) => awardReputation(f.factionId, theme.id, FACTION_REPUTATION_PER_CORRECT))
        )
        // Reputation still quietly accrues before the Factions tab unlocks
        // (nothing is lost), but the toast/promotion sting stay silent so a
        // brand-new player isn't shown a system they can't see yet.
        if (isUnlocked('factions', nextProgress.level)) {
          const promotedIndex = matchedFactions.findIndex(
            (f, i) => rankForReputation(f.rankNames, beforeReps[i].reputation) !== rankForReputation(f.rankNames, afterReps[i].reputation)
          )
          factionPromoted = promotedIndex !== -1
          if (factionPromoted) {
            setPromotionCeremony({
              faction: matchedFactions[promotedIndex],
              rank: rankForReputation(matchedFactions[promotedIndex].rankNames, afterReps[promotedIndex].reputation),
            })
          } else {
            setFactionToast(matchedFactions[0])
          }
        }
      }

      const secret = findSecretForTerm(theme.id, current.term)
      if (secret && !nextProgress.secretsUnlocked.includes(secret.term)) {
        finalProgress = await saveProgress(theme.id, {
          secretsUnlocked: [...nextProgress.secretsUnlocked, secret.term],
        })
        setSecretReveal(secret)
      }

      // Random intercept: a rare surprise bonus on a correct recall, awarded
      // outside the normal per-review XP so it reads as a windfall.
      const intercept = rollInterceptEvent()
      if (intercept) {
        const interceptResult = await awardBonusXp(theme.id, intercept.bonusXp)
        finalProgress = interceptResult.progress
        leveledUp = leveledUp || interceptResult.leveledUp
        newBadges = [...newBadges, ...interceptResult.newBadges]
        setInterceptToast(intercept)
      }
    }

    const nextTension = hasTension
      ? correct
        ? Math.max(0, tension - 1)
        : Math.min(3, tension + 1)
      : 0

    const sfxOn = await getSetting('sfxEnabled', true)
    const streakTierUp = streakTier(nextProgress.streak) > streakTier(progress?.streak ?? 0)
    const comboMilestoneHit = correct && nextCombo > 0 && nextCombo % COMBO_MILESTONE_STEP === 0
    if (sfxOn) {
      if (correct) playSuccessSfx(theme.audio.sfxVariant, nextCombo)
      else playMissSfx(theme.audio.sfxVariant, nextTension)
      if (comboMilestoneHit) playComboMilestone()
      if (streakTierUp) playStreakTierUp()
      // Faction promotion sting now plays once via the promotionCeremony
      // effect below, covering both this path and resolveDoubleAgent's.
    }
    if (!correct) {
      setFlickerKey((k) => k + 1)
      setShake(true)
      setTimeout(() => setShake(false), 1000)
    }
    if (hasTension) setTension(nextTension)

    if (STREAK_GLYPHS[theme.id]) {
      if (!correct && combo > 0) {
        setScatterCount(combo)
        setStreakScatter(true)
        setTimeout(() => setStreakScatter(false), 650)
      } else {
        setStreakScatter(false)
      }
    }
    setCombo(nextCombo)
    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (correct ? 1 : 0),
      xpGained: prev.xpGained + xpGained,
      bestCombo: Math.max(prev.bestCombo, nextCombo),
      badgesEarned: prev.badgesEarned + newBadges.length,
      questCompleted: prev.questCompleted || dailyQuest.justCompleted,
    }))

    setProgress(finalProgress)
    const momentumTag = momentumMultiplier > 1 ? ` (×${momentumMultiplier} MOMENTUM)` : ''
    const eventTag = worldEvent ? ` (${worldEvent.label} ×${worldEvent.xpMultiplier})` : ''
    setXpToast(
      xpGained > 0
        ? `+${xpGained} XP${coldCaseSession ? ' (COLD CASE ×2)' : ''}${momentumTag}${eventTag}`
        : ''
    )
    setBadgeToast(newBadges.length > 0 ? newBadges[0] : null)
    setQuestToast(dailyQuest.justCompleted)
    setShieldToast(streakShieldUsed)
    if (sfxOn) {
      if (newBadges.length > 0) playBadgeUnlock()
      else if (dailyQuest.justCompleted) playQuestComplete()
    }

    if (leveledUp) {
      const newStage = theme.stages?.some((s) => s.minLevel === nextProgress.level)
        ? resolveThemeStage(theme, nextProgress.level)
        : null
      setLevelUpInfo({
        level: nextProgress.level,
        rank: rankForLevel(theme.rankNames, nextProgress.level),
        stageName: newStage?.name ?? null,
      })
      if (sfxOn) playLevelUpFanfare()
      if (newStage) {
        setEraWipe(true)
        setTimeout(() => setEraWipe(false), 1500)
      }
    }
  }

  /**
   * Resolves a "double agent" word — one that fed two rival factions —
   * by awarding reputation only to the chosen faction. The other faction
   * gets nothing this round, making the choice a real tradeoff rather than
   * flavor text.
   * @param {import('../factions/factions.js').FactionDef} faction
   */
  async function resolveDoubleAgent(faction) {
    const before = await getFactionProgress(faction.factionId, theme.id)
    const after = await awardReputation(faction.factionId, theme.id, FACTION_REPUTATION_PER_CORRECT)
    const beforeRank = rankForReputation(faction.rankNames, before.reputation)
    const afterRank = rankForReputation(faction.rankNames, after.reputation)
    if (beforeRank !== afterRank) {
      setPromotionCeremony({ faction, rank: afterRank })
    } else {
      setFactionToast(faction)
    }
    setDoubleAgentChoice(null)
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
    setShieldToast(false)
    setInterceptToast(null)
    setLevelUpInfo(null)
    setFactionToast(null)
    setPromotionCeremony(null)
    setDoubleAgentChoice(null)
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
      } else if (e.key === 'Enter' && !doubleAgentChoice) {
        e.preventDefault()
        nextWord()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // Plays the promotion sting exactly once per ceremony, whichever path
  // (routine recall or a resolved double-agent choice) triggered it.
  useEffect(() => {
    if (!promotionCeremony) return
    getSetting('sfxEnabled', true).then((sfxOn) => {
      if (sfxOn) playFactionPromotion()
    })
  }, [promotionCeremony])

  // Announces the session-complete cadence exactly once, the moment the due
  // queue drains after at least one graded review this session.
  useEffect(() => {
    if (!queue || queue.length !== 0 || sessionStats.reviewed === 0 || sessionCompleteAnnouncedRef.current) return
    sessionCompleteAnnouncedRef.current = true
    getSetting('sfxEnabled', true).then((sfxOn) => {
      if (sfxOn) playSessionComplete()
    })
    // Refreshes the cold-case list so it reflects words just reviewed —
    // otherwise the CTA could re-offer words that are no longer due.
    getColdCaseWords(theme.id).then(setColdCaseWords)
  }, [queue, sessionStats.reviewed, theme.id])

  if (queue === null || progress === null) {
    return <p className="empty-state">Loading...</p>
  }

  const coldCaseCta =
    coldCaseWords.length > 0 && !coldCaseSession ? (
      <button className="cold-case-btn" onClick={startColdCaseSession}>
        🗃 {coldCaseWords.length} COLD CASE{coldCaseWords.length > 1 ? 'S' : ''} — INVESTIGATE (×2 XP)
      </button>
    ) : null

  const freeDrillCta = (
    <button className="free-drill-btn" onClick={startFreePractice}>
      🎯 FREE DRILL — PRACTICE NOW
    </button>
  )

  if (queue.length === 0) {
    if (sessionStats.reviewed === 0) {
      return (
        <div className="empty-state-wrap">
          <span className="empty-state-icon" aria-hidden="true">📭</span>
          <p className="empty-state">
            No words due for review. Select a word on any page and right-click to archive it.
          </p>
          {coldCaseCta}
          {freeDrillCta}
        </div>
      )
    }
    const accuracyPct = Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
    // Cliffhanger: leave the player one concrete, nearby goal on the way out —
    // the next locked feature if there is one, otherwise XP to the next level.
    const sc = levelProgress(progress.xp)
    const upcomingFeature = nextFeatureUnlock(sc.level)
    const cliffhanger = upcomingFeature
      ? {
          icon: '🔒',
          text: `${upcomingFeature.label} unlocks at level ${upcomingFeature.unlockLevel} — ${upcomingFeature.levelsAway} level${upcomingFeature.levelsAway > 1 ? 's' : ''} to go`,
        }
      : {
          icon: '⚑',
          text: `${sc.xpToNextLevel - sc.xpIntoLevel} XP to level ${sc.level + 1}`,
        }
    return (
      <div className="session-complete">
        <p className="session-complete-title">Session Complete</p>
        <div className="session-complete-stats">
          <div className="session-stat">
            <span className="session-stat-value">{sessionStats.reviewed}</span>
            <span className="session-stat-label">reviewed</span>
          </div>
          <div className="session-stat">
            <span className="session-stat-value">{accuracyPct}%</span>
            <span className="session-stat-label">accuracy</span>
          </div>
          <div className="session-stat">
            <span className="session-stat-value">+{sessionStats.xpGained}</span>
            <span className="session-stat-label">XP</span>
          </div>
          <div className="session-stat">
            <span className="session-stat-value">{sessionStats.bestCombo}</span>
            <span className="session-stat-label">best combo</span>
          </div>
        </div>
        {(sessionStats.badgesEarned > 0 || sessionStats.questCompleted) && (
          <p className="session-complete-extra">
            {sessionStats.badgesEarned > 0 &&
              `${sessionStats.badgesEarned} badge${sessionStats.badgesEarned > 1 ? 's' : ''} earned`}
            {sessionStats.badgesEarned > 0 && sessionStats.questCompleted && ' · '}
            {sessionStats.questCompleted && 'Daily quest complete'}
          </p>
        )}
        <div className="session-cliffhanger">
          <span className="cliffhanger-icon" aria-hidden="true">{cliffhanger.icon}</span>
          <span className="cliffhanger-text">{cliffhanger.text}</span>
        </div>
        <p className="empty-state">No more words due. Come back later, or archive new ones from any page.</p>
        {coldCaseCta}
        {freeDrillCta}
      </div>
    )
  }

  const currentMultiplier = comboMultiplier(combo)
  const momentumFill = comboMeterFill(combo)
  const momentumTier = combo >= 12 ? 4 : combo >= 8 ? 3 : combo >= 5 ? 2 : combo >= 3 ? 1 : 0

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

      {promotionCeremony && (
        <div className="promotion-ceremony-overlay">
          <div className="promotion-ceremony-card">
            <div className="promotion-ceremony-label">◆ PROMOTED ◆</div>
            <div className="promotion-ceremony-emblem">{promotionCeremony.faction.emblem}</div>
            <div className="promotion-ceremony-faction">{promotionCeremony.faction.name}</div>
            <div className="promotion-ceremony-rank">{promotionCeremony.rank}</div>
            <p className="promotion-ceremony-ideology">{promotionCeremony.faction.ideology}</p>
            <button className="promotion-ceremony-dismiss" onClick={() => setPromotionCeremony(null)}>
              CONTINUE →
            </button>
          </div>
        </div>
      )}
      {eraWipe && <div className="era-wipe" aria-hidden="true" />}

      {worldEvent && (
        <div className="world-event-banner" title={worldEvent.blurb}>
          <span className="world-event-icon" aria-hidden="true">{worldEvent.icon}</span>
          <span className="world-event-label">{worldEvent.label}</span>
          <span className="world-event-mult">×{worldEvent.xpMultiplier} XP</span>
        </div>
      )}

      <div className="review-stats">
        <span className="stat-rank">⚑ {rank}</span>
        <span className={`stat-streak tier-${streakTier(progress.streak)}`}>
          🔥 <span key={progress.streak} className="streak-number">{progress.streak}</span>
        </span>
        {progress.streakShields > 0 && (
          <span
            className="stat-shields"
            title={`${progress.streakShields} streak shield${progress.streakShields > 1 ? 's' : ''} — each forgives one missed day`}
          >
            🛡 {progress.streakShields}
          </span>
        )}
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
        className={`momentum-meter tier-${momentumTier} ${combo > 0 ? 'active' : ''}`}
        title={`Momentum: answer in a row to raise your XP multiplier (currently ×${currentMultiplier})`}
      >
        <span className="momentum-label">MOMENTUM</span>
        <div className="momentum-track">
          <div className="momentum-fill" style={{ width: `${Math.round(momentumFill * 100)}%` }} />
        </div>
        <span className="momentum-mult">×{currentMultiplier}</span>
      </div>

      <div
        className={`term-card ${combo >= 8 ? 'combo-glow-hot' : combo >= 5 ? 'combo-glow' : ''} ${flickerKey > 0 ? 'fx-error-flicker' : ''} ${isAnswered ? 'is-answered' : ''} ${
          isAnswered && !isCorrect && theme.id === 'russian' ? 'redact' : ''
        } ${isAnswered && !isCorrect && theme.id === 'french' && tension >= 3 ? 'tribunal-sweep' : ''} ${
          isAnswered && !isCorrect && theme.id === 'spanish' && tension >= 3 ? 'air-raid' : ''
        }`}
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
          {reverseMode ? 'REVERSE INTERROGATION' : theme.eyebrowLabel}
          {current.struggling && theme.strugglingLabel && (
            <span className="struggling-tag">{theme.strugglingLabel}</span>
          )}
        </div>
        <div className="term-word">
          {reverseMode ? current.translation || '(no translation)' : current.term}
          {(!reverseMode || isAnswered) && (
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
          )}
        </div>
        {current.transliteration && (!reverseMode || isAnswered) && (
          <div className="term-translit">[ {current.transliteration} ]</div>
        )}
        {STREAK_GLYPHS[theme.id] && (combo > 0 || streakScatter) && (
          <div className={`streak-column ${streakScatter ? 'scatter' : ''}`} aria-hidden="true">
            {Array.from({ length: Math.min(streakScatter ? scatterCount : combo, 10) }).map((_, i) => (
              <span
                key={i}
                className="streak-glyph"
                style={{
                  animationDelay: `${i * 55}ms`,
                  '--scatter-x': `${(i % 2 === 0 ? 1 : -1) * (18 + i * 5)}px`,
                }}
              >
                {STREAK_GLYPHS[theme.id]}
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
              <span className="option-label">
                {opt.label}
                {reverseMode && opt.translit && <span className="option-translit"> [ {opt.translit} ]</span>}
              </span>
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
          {levelUpInfo.stageName && <div className="level-up-stage">A new era dawns: {levelUpInfo.stageName}</div>}
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

          {(badgeToast || questToast || factionToast || shieldToast || interceptToast || (isCorrect && combo >= 3)) && (
            <div className="result-extras">
              {isCorrect && combo >= 3 && <span className="result-chip combo-chip">🔥 Combo x{combo}</span>}
              {interceptToast && (
                <span className="result-chip intercept-chip">
                  {interceptToast.icon} {interceptToast.label} +{interceptToast.bonusXp} XP
                </span>
              )}
              {shieldToast && <span className="result-chip shield-chip">🛡 Streak saved</span>}
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

      {isAnswered && !doubleAgentChoice && (
        <button className="next-btn" onClick={nextWord}>
          {theme.nextButtonLabel}
        </button>
      )}

      {doubleAgentChoice && (
        <div className="double-agent-overlay">
          <div className="double-agent-card">
            <div className="double-agent-label">⚠ DOUBLE AGENT</div>
            <p className="double-agent-copy">
              "{doubleAgentChoice.term}" serves two masters. Who gets the report?
            </p>
            <div className="double-agent-options">
              {doubleAgentChoice.factions.map((faction) => (
                <button
                  key={faction.factionId}
                  className="double-agent-btn"
                  onClick={() => resolveDoubleAgent(faction)}
                >
                  <span className="double-agent-emblem">{faction.emblem}</span>
                  <span className="double-agent-name">{faction.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
