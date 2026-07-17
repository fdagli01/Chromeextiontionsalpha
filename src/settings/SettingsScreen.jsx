import { useEffect, useRef, useState } from 'react'
import { getSetting, setSetting } from '../db/settingsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { exportBackup, importBackup } from '../db/backup.js'
import { refreshCuratedContent } from '../db/contentRefresh.js'
import { seedSampleWords } from '../db/seedWords.js'
import { listThemes } from '../themes/index.js'
import { pauseThemeAudio } from '../audio/themeAudioControl.js'
import { BADGE_DEFS, resolveBadges } from '../badges/badges.js'
import { VaultSection } from './VaultSection.jsx'
import './SettingsScreen.css'

export function SettingsScreen({ activeThemeId, onThemeChange }) {
  const [sfxEnabled, setSfxEnabled] = useState(null)
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(null)
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(null)
  const [earnedBadges, setEarnedBadges] = useState(null)
  const [backupMessage, setBackupMessage] = useState('')
  const [contentMessage, setContentMessage] = useState('')
  const [aiEngineEnabled, setAiEngineEnabled] = useState(null)
  const [aiEngineApiKey, setAiEngineApiKey] = useState('')
  const [seedMessage, setSeedMessage] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    getSetting('sfxEnabled', true).then(setSfxEnabled)
    getSetting('autoSpeakEnabled', true).then(setAutoSpeakEnabled)
    getSetting('soundscapeEnabled', true).then(setSoundscapeEnabled)
    getSetting('aiEngineEnabled', false).then(setAiEngineEnabled)
    getSetting('aiEngineApiKey', '').then(setAiEngineApiKey)
  }, [])

  useEffect(() => {
    let cancelled = false
    getProgress(activeThemeId).then((progress) => {
      if (!cancelled) setEarnedBadges(resolveBadges(progress.badges))
    })
    return () => {
      cancelled = true
    }
  }, [activeThemeId])

  if (
    sfxEnabled === null ||
    autoSpeakEnabled === null ||
    soundscapeEnabled === null ||
    earnedBadges === null ||
    aiEngineEnabled === null
  ) {
    return <p className="empty-state">Loading...</p>
  }

  async function toggleSoundscape() {
    const next = !soundscapeEnabled
    setSoundscapeEnabled(next)
    await setSetting('soundscapeEnabled', next)
  }

  async function toggleSfx() {
    const next = !sfxEnabled
    setSfxEnabled(next)
    await setSetting('sfxEnabled', next)
  }

  async function toggleAutoSpeak() {
    const next = !autoSpeakEnabled
    setAutoSpeakEnabled(next)
    await setSetting('autoSpeakEnabled', next)
  }

  async function changeTheme(themeId) {
    pauseThemeAudio(activeThemeId)
    await setSetting('activeThemeId', themeId)
    onThemeChange(themeId)
  }

  async function handleExport() {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `polyglot-chronicle-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setBackupMessage(`${backup.words.length} words saved to file.`)
  }

  function triggerImport() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const data = JSON.parse(await file.text())
      const { wordsImported } = await importBackup(data)
      setBackupMessage(
        `${wordsImported} words imported. Close and reopen the popup to see them.`
      )
    } catch {
      setBackupMessage('Import failed: file is invalid or corrupted.')
    }
  }

  async function toggleAiEngine() {
    const next = !aiEngineEnabled
    setAiEngineEnabled(next)
    await setSetting('aiEngineEnabled', next)
  }

  async function handleApiKeyBlur(e) {
    const key = e.target.value.trim()
    setAiEngineApiKey(key)
    await setSetting('aiEngineApiKey', key)
  }

  async function handleRefreshContent() {
    setContentMessage('Refreshing...')
    const { total, updated } = await refreshCuratedContent()
    setContentMessage(
      updated > 0
        ? `Added missing example sentences/philosophy notes/historical facts to ${updated}/${total} words.`
        : `Checked ${total} words — no new content to add.`
    )
  }

  async function handleSeedSampleWords() {
    setSeedMessage('Loading...')
    const { total, added } = await seedSampleWords(activeThemeId)
    setSeedMessage(
      added > 0
        ? `Added ${added}/${total} sample words. Close and reopen the popup to see them.`
        : `All ${total} sample words are already in your archive.`
    )
  }

  return (
    <div className="settings-list">
      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Sound Effects</span>
          <span className="hint">Correct/wrong answer sounds (stamp/static)</span>
        </div>
        <button className={`toggle-button ${sfxEnabled ? 'on' : ''}`} onClick={toggleSfx}>
          {sfxEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Auto Pronunciation</span>
          <span className="hint">Automatically speak the word when it appears</span>
        </div>
        <button className={`toggle-button ${autoSpeakEnabled ? 'on' : ''}`} onClick={toggleAutoSpeak}>
          {autoSpeakEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Audio Immersion</span>
          <span className="hint">Play a brief era soundscape under each pronunciation</span>
        </div>
        <button className={`toggle-button ${soundscapeEnabled ? 'on' : ''}`} onClick={toggleSoundscape}>
          {soundscapeEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Theme</span>
          <span className="hint">The language/era you're learning</span>
        </div>
        <select value={activeThemeId} onChange={(e) => changeTheme(e.target.value)}>
          {listThemes().map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-badges">
        <span className="title">Badges ({earnedBadges.length}/{BADGE_DEFS.length})</span>
        {earnedBadges.length === 0 ? (
          <p className="hint">No badges earned yet — keep reviewing to unlock them.</p>
        ) : (
          <div className="badges-grid">
            {earnedBadges.map((b) => (
              <span className="badge-chip" key={b.id} title={b.name}>
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <VaultSection themeId={activeThemeId} />

      <div className="settings-backup">
        <span className="title">Sample Words</span>
        <span className="hint">
          Loads 10 curated words for the current theme so you can try reviewing without
          right-clicking words on the web first.
        </span>
        <div className="backup-buttons">
          <button className="backup-button" onClick={handleSeedSampleWords}>
            🌱 Load Sample Words
          </button>
        </div>
        {seedMessage && <p className="hint">{seedMessage}</p>}
      </div>

      <div className="settings-backup">
        <span className="title">AI Chronicle Engine</span>
        <span className="hint">
          Generates a historical sentence, translation, and insight for words missing
          from the static archive, using your own Google Gemini API key.
        </span>
        <div className="ai-engine-toggle-row">
          <span className="hint">Enabled</span>
          <button className={`toggle-button ${aiEngineEnabled ? 'on' : ''}`} onClick={toggleAiEngine}>
            {aiEngineEnabled ? 'On' : 'Off'}
          </button>
        </div>
        {aiEngineEnabled && (
          <input
            className="ai-api-key-input"
            type="password"
            placeholder="Gemini API Key (AIza...)"
            defaultValue={aiEngineApiKey}
            onBlur={handleApiKeyBlur}
          />
        )}
      </div>

      <div className="settings-backup">
        <span className="title">Refresh Content</span>
        <span className="hint">
          Fills in missing content — like example sentences or philosophy notes added
          later — for words you already captured.
        </span>
        <div className="backup-buttons">
          <button className="backup-button" onClick={handleRefreshContent}>
            ✨ Refresh Content
          </button>
        </div>
        {contentMessage && <p className="hint">{contentMessage}</p>}
      </div>

      <div className="settings-backup">
        <span className="title">Backup</span>
        <span className="hint">
          Save to a file so your words aren't lost if the extension's folder moves or reloads.
        </span>
        <div className="backup-buttons">
          <button className="backup-button" onClick={handleExport}>
            ⬇ Export
          </button>
          <button className="backup-button" onClick={triggerImport}>
            ⬆ Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
        </div>
        {backupMessage && <p className="hint">{backupMessage}</p>}
      </div>

      <p className="settings-hint-block">Use the 📻 bar above to toggle ambient sound and switch channels.</p>
      <p className="settings-version">Version {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '?'}</p>
    </div>
  )
}
