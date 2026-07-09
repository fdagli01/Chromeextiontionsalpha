import { useEffect, useState } from 'react'
import { getSetting, setSetting } from '../db/settingsRepo.js'
import { listThemes } from '../themes/index.js'
import { pauseRadio } from '../audio/radioPlayer.js'
import './SettingsScreen.css'

export function SettingsScreen({ activeThemeId, onThemeChange }) {
  const [sfxEnabled, setSfxEnabled] = useState(null)

  useEffect(() => {
    getSetting('sfxEnabled', true).then(setSfxEnabled)
  }, [])

  if (sfxEnabled === null) {
    return <p className="empty-state">Yükleniyor...</p>
  }

  async function toggleSfx() {
    const next = !sfxEnabled
    setSfxEnabled(next)
    await setSetting('sfxEnabled', next)
  }

  async function changeTheme(themeId) {
    pauseRadio()
    await setSetting('activeThemeId', themeId)
    onThemeChange(themeId)
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

      <p className="settings-hint-block">Radyoyu açmak/kapatmak ve frekans değiştirmek için üstteki 📻 çubuğunu kullan.</p>
    </div>
  )
}
