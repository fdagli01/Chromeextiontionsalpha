import { useEffect, useState } from 'react'
import { ThemeProvider, useThemeConfig } from '../components/ThemeProvider.jsx'
import { DEFAULT_THEME_ID } from '../themes/index.js'
import { getSetting } from '../db/settingsRepo.js'
import { ReviewScreen } from '../review/ReviewScreen.jsx'
import { ArchiveScreen } from '../archive/ArchiveScreen.jsx'
import { SettingsScreen } from '../settings/SettingsScreen.jsx'
import {
  getThemeAudioChannelLabel,
  hasThemeAudio,
  isThemeAudioPlaying,
  nextThemeAudioChannel,
  pauseThemeAudio,
  playThemeAudio,
} from '../audio/themeAudioControl.js'
import './App.css'

function AppShell({ activeThemeId, onThemeChange }) {
  const theme = useThemeConfig()
  const [activeTab, setActiveTab] = useState('review')
  const [audioPlaying, setAudioPlaying] = useState(isThemeAudioPlaying(theme.id))
  const [audioLabel, setAudioLabel] = useState(getThemeAudioChannelLabel(theme.id))

  const hasAudio = hasThemeAudio(theme.id)

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
    { id: 'archive', icon: '📁', label: 'ARŞİV', node: <ArchiveScreen /> },
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
      </header>

      <main className="app-content">{active.node}</main>

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
              title="Atmosfer sesi aç/kapat"
            >
              <span className="tab-icon">📻</span>
              <span className="tab-label">{audioPlaying ? audioLabel : 'SES'}</span>
            </button>
            <button className="tab-next" onClick={advanceChannel} title="Sonraki kanal">
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
