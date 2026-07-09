import { useEffect, useState } from 'react'
import { ThemeProvider, useThemeConfig } from '../components/ThemeProvider.jsx'
import { DEFAULT_THEME_ID } from '../themes/index.js'
import { getSetting } from '../db/settingsRepo.js'
import { ReviewScreen } from '../review/ReviewScreen.jsx'
import { ArchiveScreen } from '../archive/ArchiveScreen.jsx'
import { SettingsScreen } from '../settings/SettingsScreen.jsx'
import {
  getCurrentChannel,
  isRadioPlaying,
  nextChannel,
  pauseRadio,
  playRadio,
} from '../audio/radioPlayer.js'
import './App.css'

const RADIO_THEMES = new Set(['russian'])

function AppShell({ activeThemeId, onThemeChange }) {
  const theme = useThemeConfig()
  const [activeTab, setActiveTab] = useState('review')
  const [radioPlaying, setRadioPlaying] = useState(isRadioPlaying())
  const [radioChannel, setRadioChannel] = useState(getCurrentChannel())

  const hasRadio = RADIO_THEMES.has(theme.id)

  function toggleRadio() {
    if (radioPlaying) {
      pauseRadio()
    } else {
      playRadio()
    }
    setRadioPlaying(!radioPlaying)
    setRadioChannel(getCurrentChannel())
  }

  function advanceChannel() {
    nextChannel()
    setRadioChannel(getCurrentChannel())
    setRadioPlaying(true)
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
        {hasRadio && (
          <>
            <button
              className={`tab-radio ${radioPlaying ? 'on' : ''}`}
              onClick={toggleRadio}
              title="Radyo aç/kapat"
            >
              <span className="tab-icon">📻</span>
              <span className="tab-label">{radioPlaying ? `CH-${radioChannel}` : 'RADYO'}</span>
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
