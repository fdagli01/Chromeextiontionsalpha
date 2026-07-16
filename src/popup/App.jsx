import { useEffect, useState } from 'react'
import { ThemeProvider, useThemeConfig } from '../components/ThemeProvider.jsx'
import { DEFAULT_THEME_ID, listThemes } from '../themes/index.js'
import { getSetting, setSetting } from '../db/settingsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { onProgressChanged } from '../xp/progressEvents.js'
import { isUnlocked, UNLOCK_LEVELS } from '../progression/unlocks.js'
import { getWeeklySummary } from '../db/activityLog.js'
import { ReviewScreen } from '../review/ReviewScreen.jsx'
import { ArchiveScreen } from '../archive/ArchiveScreen.jsx'
import { FactionsScreen } from '../factions/FactionsScreen.jsx'
import { SettingsScreen } from '../settings/SettingsScreen.jsx'
import { CrisisScreen } from '../crisis/CrisisScreen.jsx'
import { WeeklyReportOverlay } from './WeeklyReportOverlay.jsx'
import { OnboardingOverlay } from './OnboardingOverlay.jsx'
import { DailyBriefingOverlay } from './DailyBriefingOverlay.jsx'
import { computeDailyObjectives } from '../progression/briefing.js'
import {
  getThemeAudioChannelLabel,
  hasThemeAudio,
  isThemeAudioPlaying,
  nextThemeAudioChannel,
  pauseThemeAudio,
  playThemeAudio,
  stopAllThemeAudio,
} from '../audio/themeAudioControl.js'
import './App.css'

const isDetachedWindow = new URLSearchParams(window.location.search).has('window')
if (isDetachedWindow) document.body.classList.add('is-windowed')
const WEEKLY_REPORT_SHOWN_KEY = 'weeklyReportShownWeek'
const ONBOARDING_SEEN_KEY = 'onboardingSeenV1'
const BRIEFING_SHOWN_KEY = 'dailyBriefingShownDate'

/** Monday-of-the-current-week as a YYYY-MM-DD key, used to show the intel report once per week. */
function currentWeekKey(now = new Date()) {
  const monday = new Date(now)
  const day = monday.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diffToMonday)
  return monday.toISOString().slice(0, 10)
}

// Hand-designed per-theme flag glyphs for the header switcher — evoking each
// era rather than a literal modern national flag (there's no "Roman Empire"
// or "Revolutionary France" emoji flag to borrow). `stripes` builds a CSS
// gradient background, `symbol` sits centered on top.
const THEME_FLAGS = {
  russian: { stripes: ['#8b0d0d', '#8b0d0d'], symbol: '☭', symbolColor: '#f4c430' },
  italian: { stripes: ['#5c1a1a', '#8a1f1f', '#5c1a1a'], symbol: '🦅', symbolColor: '#d4af37' },
  portuguese: { stripes: ['#046a38', '#046a38', '#c8102e', '#c8102e'], symbol: '⚓', symbolColor: '#f4c430' },
  french: { stripes: ['#0055a4', '#ffffff', '#ef4135'], symbol: '⚜', symbolColor: '#0a0a0a' },
  // The Second Republic's tricolor (purple/yellow/red) rather than modern
  // Spain's flag — this era is the 1936–39 Civil War, not present-day Spain.
  spanish: { stripes: ['#6b3fa0', '#f4c430', '#7a1f1f'], symbol: '★', symbolColor: '#f4c430' },
}

function themeFlagStyle(themeId) {
  const flag = THEME_FLAGS[themeId]
  if (!flag) return {}
  const stop = 100 / flag.stripes.length
  const stops = flag.stripes.map((color, i) => `${color} ${i * stop}%, ${color} ${(i + 1) * stop}%`).join(', ')
  return { background: `linear-gradient(90deg, ${stops})` }
}

/**
 * Opens this same popup UI in a real, separate browser window instead of
 * the transient action popup — a normal window doesn't auto-close when the
 * user clicks elsewhere, which the action popup always does by design.
 */
function openInWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL('src/popup/index.html?window=1'),
    type: 'popup',
    width: 760,
    height: 720,
  })
}

function AppShell({ activeThemeId, onThemeChange }) {
  const theme = useThemeConfig()
  const [activeTab, setActiveTab] = useState('review')
  const [audioPlaying, setAudioPlaying] = useState(isThemeAudioPlaying(theme.id))
  const [audioLabel, setAudioLabel] = useState(getThemeAudioChannelLabel(theme.id))
  const [pendingCrisis, setPendingCrisis] = useState(null)
  const [activeCrisis, setActiveCrisis] = useState(null)
  const [level, setLevel] = useState(1)
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [dailyBriefing, setDailyBriefing] = useState(null)

  const hasAudio = hasThemeAudio(theme.id)

  // First-ever launch only: this app front-loads a lot of systems (FSRS
  // review, factions, crises, secrets) a brand-new user has no way to
  // discover from an empty "no words due" screen alone. Uses sync storage
  // (not local) since "have I seen the intro" is a fact about the person,
  // not about a device — the word archive itself stays IndexedDB/per-device
  // regardless, so this doesn't promise cross-device progress, just avoids
  // re-showing the intro on every machine the user opens the extension on.
  useEffect(() => {
    chrome.storage.sync.get(ONBOARDING_SEEN_KEY).then(({ [ONBOARDING_SEEN_KEY]: seen }) => {
      if (!seen) setShowOnboarding(true)
    })
  }, [])

  function dismissOnboarding() {
    setShowOnboarding(false)
    chrome.storage.sync.set({ [ONBOARDING_SEEN_KEY]: true })
  }

  // On theme switch, silence whatever the previous theme left playing —
  // otherwise its soundscape (e.g. ocean waves) keeps running under the new
  // theme's audio, since the toggle only controls the new theme's engine.
  // Harmless on first mount: stopping idle audio is a no-op.
  useEffect(() => {
    stopAllThemeAudio()
    setAudioPlaying(false)
    setAudioLabel(getThemeAudioChannelLabel(theme.id))
  }, [theme.id])

  // Monday-first-open intel report: shows at most once per calendar week,
  // and only if there's a full week's history to summarize. Also sync
  // storage — "seen this week's report" is per-person, not per-device.
  // getWeeklySummary itself still only reflects *this* device's activity
  // log (see db/activityLog.js), so the report's numbers stay local; only
  // the "already shown" flag travels with the account.
  useEffect(() => {
    const weekKey = currentWeekKey()
    if (new Date().getDay() !== 1) return
    chrome.storage.sync.get(WEEKLY_REPORT_SHOWN_KEY).then(({ [WEEKLY_REPORT_SHOWN_KEY]: lastShown }) => {
      if (lastShown === weekKey) return
      getWeeklySummary().then((summary) => {
        if (summary.reviewed === 0) return
        setWeeklyReport(summary)
        chrome.storage.sync.set({ [WEEKLY_REPORT_SHOWN_KEY]: weekKey })
      })
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    chrome.storage.local.get('pendingCrisis').then(({ pendingCrisis: stored }) => {
      if (!cancelled && stored?.themeId === theme.id) setPendingCrisis(stored)
    })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  // Daily briefing: the first open each day surfaces a "mission envelope"
  // with the day's three objectives. Shown at most once per calendar day
  // (sync flag, so it's per-person not per-device) and never on the very
  // first launch, where the onboarding card takes precedence. Objectives are
  // computed for the active theme's tracked daily metrics.
  useEffect(() => {
    let cancelled = false
    const today = new Date().toISOString().slice(0, 10)
    chrome.storage.sync
      .get([BRIEFING_SHOWN_KEY, ONBOARDING_SEEN_KEY])
      .then(({ [BRIEFING_SHOWN_KEY]: lastShown, [ONBOARDING_SEEN_KEY]: onboardingSeen }) => {
        if (cancelled || lastShown === today || !onboardingSeen) return
        getProgress(theme.id).then((progress) => {
          if (cancelled) return
          setDailyBriefing(computeDailyObjectives(progress, today))
          chrome.storage.sync.set({ [BRIEFING_SHOWN_KEY]: today })
        })
      })
    return () => {
      cancelled = true
    }
  }, [theme.id])

  // Drives the progressive-unlock tab gating below — level starts at 1 on
  // theme switch and stays live via progress-changed events, so a level-up
  // mid-review unlocks a tab immediately instead of waiting for a reopen.
  useEffect(() => {
    let cancelled = false
    setLevel(1)
    getProgress(theme.id).then((progress) => {
      if (!cancelled) setLevel(progress.level)
    })
    const unsubscribe = onProgressChanged(theme.id, (progress) => setLevel(progress.level))
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [theme.id])

  async function handleCrisisResolved() {
    await chrome.storage.local.remove('pendingCrisis')
    setPendingCrisis(null)
    setActiveCrisis(null)
  }

  function toggleAudio() {
    if (audioPlaying) {
      pauseThemeAudio(theme.id)
    } else {
      playThemeAudio(theme.id)
    }
    setAudioPlaying(!audioPlaying)
    setAudioLabel(getThemeAudioChannelLabel(theme.id))
  }

  function advanceChannel() {
    nextThemeAudioChannel(theme.id)
    setAudioLabel(getThemeAudioChannelLabel(theme.id))
    setAudioPlaying(true)
  }

  // Header flag button: cycles straight to the next era without a trip
  // through Mainframe settings — same switch logic as the settings dropdown
  // (pause outgoing audio, persist, notify parent), just one click away.
  async function cycleTheme() {
    const ids = listThemes().map((t) => t.id)
    const nextId = ids[(ids.indexOf(theme.id) + 1) % ids.length]
    pauseThemeAudio(theme.id)
    await setSetting('activeThemeId', nextId)
    onThemeChange(nextId)
  }

  const TABS = [
    { id: 'review', icon: '⚑', label: 'INTERROGATE', node: <ReviewScreen /> },
    { id: 'archive', icon: '📁', label: 'ARCHIVE', node: <ArchiveScreen /> },
    {
      id: 'factions',
      icon: '🎖',
      label: 'FACTIONS',
      node: <FactionsScreen />,
      locked: !isUnlocked('factions', level),
      unlockLevel: UNLOCK_LEVELS.factions,
    },
    {
      id: 'settings',
      icon: '⚙',
      label: 'MAINFRAME',
      node: <SettingsScreen activeThemeId={activeThemeId} onThemeChange={onThemeChange} />,
    },
  ]
  const rawActive = TABS.find((t) => t.id === activeTab)
  const active = rawActive && !rawActive.locked ? rawActive : TABS[0]

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-emblem">{theme.emblem}</div>
        <div className="app-header-text">
          <h1>
            {theme.terminalName} <span className="header-ver">{theme.terminalVersion}</span>
          </h1>
          <p className="era">{theme.tagline.replace('{level}', theme.level)}</p>
        </div>
        <button
          className="theme-flag-btn"
          style={themeFlagStyle(theme.id)}
          onClick={cycleTheme}
          title="Switch era"
        >
          <span className="theme-flag-symbol" style={{ color: THEME_FLAGS[theme.id]?.symbolColor }}>
            {THEME_FLAGS[theme.id]?.symbol}
          </span>
        </button>
        {!isDetachedWindow && (
          <button className="pin-window-btn" onClick={openInWindow} title="Open in a window that stays open">
            📌
          </button>
        )}
        {pendingCrisis && !activeCrisis && (
          <button className="crisis-alert-btn" onClick={() => setActiveCrisis(pendingCrisis)}>
            ⚠ CRISIS
          </button>
        )}
      </header>

      <main className="app-content">
        {activeCrisis ? (
          <CrisisScreen crisis={activeCrisis} onResolve={handleCrisisResolved} />
        ) : (
          active.node
        )}
      </main>

      <nav className="app-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${tab.id === active.id ? 'active' : ''} ${tab.locked ? 'locked' : ''}`}
            onClick={() => !tab.locked && setActiveTab(tab.id)}
            disabled={tab.locked}
            title={tab.locked ? `Unlocks at level ${tab.unlockLevel}` : undefined}
          >
            <span className="tab-icon">{tab.locked ? '🔒' : tab.icon}</span>
            <span className="tab-label">{tab.locked ? `LVL ${tab.unlockLevel}` : tab.label}</span>
          </button>
        ))}
        {hasAudio && (
          <>
            <button
              className={`tab-radio ${audioPlaying ? 'on' : ''}`}
              onClick={toggleAudio}
              title="Toggle ambient sound"
            >
              <span className="tab-icon">📻</span>
              <span className="tab-label">{audioPlaying ? audioLabel : 'SOUND'}</span>
            </button>
            <button className="tab-next" onClick={advanceChannel} title="Next channel">
              <span className="tab-icon">⏭</span>
              <span className="tab-label">NEXT</span>
            </button>
          </>
        )}
      </nav>

      {weeklyReport && (
        <WeeklyReportOverlay summary={weeklyReport} onDismiss={() => setWeeklyReport(null)} />
      )}
      {showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}
      {!showOnboarding && dailyBriefing && (
        <DailyBriefingOverlay
          terminalName={theme.terminalName}
          objectives={dailyBriefing}
          onDismiss={() => setDailyBriefing(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  const [themeId, setThemeId] = useState(null)

  useEffect(() => {
    getSetting('activeThemeId', DEFAULT_THEME_ID).then(setThemeId)
  }, [])

  if (themeId === null) return null

  return (
    <ThemeProvider themeId={themeId}>
      <AppShell activeThemeId={themeId} onThemeChange={setThemeId} />
    </ThemeProvider>
  )
}
