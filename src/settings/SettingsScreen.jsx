import { useEffect, useRef, useState } from 'react'
import { getSetting, setSetting } from '../db/settingsRepo.js'
import { getProgress } from '../db/progressRepo.js'
import { exportBackup, importBackup } from '../db/backup.js'
import { listThemes } from '../themes/index.js'
import { pauseThemeAudio } from '../audio/themeAudioControl.js'
import { BADGE_DEFS, resolveBadges } from '../badges/badges.js'
import './SettingsScreen.css'

export function SettingsScreen({ activeThemeId, onThemeChange }) {
  const [sfxEnabled, setSfxEnabled] = useState(null)
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(null)
  const [earnedBadges, setEarnedBadges] = useState(null)
  const [backupMessage, setBackupMessage] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    getSetting('sfxEnabled', true).then(setSfxEnabled)
    getSetting('autoSpeakEnabled', true).then(setAutoSpeakEnabled)
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

  if (sfxEnabled === null || autoSpeakEnabled === null || earnedBadges === null) {
    return <p className="empty-state">Yükleniyor...</p>
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
    link.download = `polyglot-chronicle-yedek-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setBackupMessage(`${backup.words.length} kelime dosyaya kaydedildi.`)
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
        `${wordsImported} kelime içe aktarıldı. Görünmesi için popup'ı kapatıp tekrar aç.`
      )
    } catch {
      setBackupMessage('İçe aktarma başarısız: dosya geçersiz veya bozuk.')
    }
  }

  return (
    <div className="settings-list">
      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Ses Efektleri</span>
          <span className="hint">Doğru/yanlış cevap sesleri (damga/statik)</span>
        </div>
        <button className={`toggle-button ${sfxEnabled ? 'on' : ''}`} onClick={toggleSfx}>
          {sfxEnabled ? 'Açık' : 'Kapalı'}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Otomatik Telaffuz</span>
          <span className="hint">Kelime ekrana gelince otomatik seslendirilsin</span>
        </div>
        <button className={`toggle-button ${autoSpeakEnabled ? 'on' : ''}`} onClick={toggleAutoSpeak}>
          {autoSpeakEnabled ? 'Açık' : 'Kapalı'}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Tema</span>
          <span className="hint">Öğrendiğin dil/dönem</span>
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
        <span className="title">Rozetler ({earnedBadges.length}/{BADGE_DEFS.length})</span>
        {earnedBadges.length === 0 ? (
          <p className="hint">Henüz rozet kazanmadın — tekrar yaparak kazan.</p>
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

      <div className="settings-backup">
        <span className="title">Yedekleme</span>
        <span className="hint">
          Kelimelerin uzantı klasörünün taşınması/yeniden yüklenmesiyle kaybolmasın diye dosyaya kaydet.
        </span>
        <div className="backup-buttons">
          <button className="backup-button" onClick={handleExport}>
            ⬇ Dışa Aktar
          </button>
          <button className="backup-button" onClick={triggerImport}>
            ⬆ İçe Aktar
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

      <p className="settings-hint-block">Atmosfer sesini açmak/kapatmak ve kanal değiştirmek için üstteki 📻 çubuğunu kullan.</p>
    </div>
  )
}
