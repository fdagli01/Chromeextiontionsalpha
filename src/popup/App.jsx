import { useEffect, useState } from 'react'
import { ThemeProvider, useThemeConfig } from '../components/ThemeProvider.jsx'
import { DEFAULT_THEME_ID } from '../themes/index.js'
import { getSetting } from '../db/settingsRepo.js'
import { ReviewScreen } from '../review/ReviewScreen.jsx'
import { ArchiveScreen } from '../archive/ArchiveScreen.jsx'
import { FactionsScreen } from '../factions/FactionsScreen.jsx'
import { SettingsScreen } from '../settings/SettingsScreen.jsx'
import { CrisisScreen } from '../crisis/CrisisScreen.jsx'
import {
  getThemeAudioChannelLabel,
  hasThemeAudio,
  isThemeAudioPlaying,
  nextThemeAudioChannel,
  pauseThemeAudio,
  playThemeAudio,
} from '../audio/themeAudioControl.js'
import './App.css'

const isDetachedWindow = new URLSearchParams(window.location.search).has('window')

/**
 * Opens this same popup UI in a real, separate browser window instead of
 * the transient action popup — a normal window doesn't auto-close when the
 * user clicks elsewhere, which the action popup always does by design.
 */
function openInWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL('src/popup/index.html?window=1'),
    type: 'popup',
    width: 420,
    height: 680,
  })
}

function AppShell({ activeThemeId, onThemeChange }) {
  const theme = useThemeConfig()
  const [activeTab, setActiveTab] = useState('review')
  const [audioPlaying, setAudioPlaying] = useState(isThemeAudioPlaying(theme.id))
  const [audioLabel, setAudioLabel] = useState(getThemeAudioChannelLabel(theme.id))
  const [pendingCrisis, setPendingCrisis] = useState(null)
  const [activeCrisis, setActiveCrisis] = useState(null)

  const hasAudio = hasThemeAudio(theme.id)

  useEffect(() => {
    let cancelled = false
    chrome.storage.local.get('pendingCrisis').then(({ pendingCrisis: stored }) => {
      if (!cancelled && stored?.themeId === theme.id) setPendingCrisis(stored)
    })
    return () => {
      cancelled = true
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

  const TABS = [
    { id: 'review', icon: '⚑', label: 'INTERROGATE', node: <ReviewScreen /> },
    { id: 'archive', icon: '📁', label: 'ARCHIVE', node: <ArchiveScreen /> },
    { id: 'factions', icon: '🎖', label: 'FACTIONS', node: <FactionsScreen /> },
    {
      id: 'settings',
      icon: '⚙',
      label: 'MAINFRAME',
      node: <SettingsScreen activeThemeId={activeThemeId} onThemeChange={onThemeChange} />,
    },
  ]
  const active = TABS.find((t) => t.id === activeTab)

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
            className={tab.id === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
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
