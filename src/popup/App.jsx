import { useEffect, useState } from 'react'
import { ThemeProvider, useThemeConfig } from '../components/ThemeProvider.jsx'
import { RadioBar } from '../components/RadioBar.jsx'
import { DEFAULT_THEME_ID } from '../themes/index.js'
import { getSetting } from '../db/settingsRepo.js'
import { ReviewScreen } from '../review/ReviewScreen.jsx'
import { ArchiveScreen } from '../archive/ArchiveScreen.jsx'
import { SettingsScreen } from '../settings/SettingsScreen.jsx'
import './App.css'

function AppShell({ activeThemeId, onThemeChange }) {
  const theme = useThemeConfig()
  const [activeTab, setActiveTab] = useState('review')

  const TABS = [
    { id: 'review', label: 'Tekrar', node: <ReviewScreen /> },
    { id: 'archive', label: 'Arşiv', node: <ArchiveScreen /> },
    {
      id: 'settings',
      label: 'Ayarlar',
      node: <SettingsScreen activeThemeId={activeThemeId} onThemeChange={onThemeChange} />,
    },
  ]
  const active = TABS.find((t) => t.id === activeTab)

  return (
    <div className="app">
      <header className="app-header">
        <h1>{theme.name}</h1>
        <p className="era">{theme.era}</p>
      </header>
      <RadioBar />
      <nav className="app-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="app-content">{active.node}</main>
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
