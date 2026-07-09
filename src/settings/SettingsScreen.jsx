import { useEffect, useState } from 'react'
import { getSetting, setSetting } from '../db/settingsRepo.js'
import { listThemes } from '../themes/index.js'
import { startRussianRadio, stopRadio } from '../audio/radioEngine.js'
import './SettingsScreen.css'

const RADIO_STARTERS = {
  russian: startRussianRadio,
}

export function SettingsScreen({ activeThemeId, onThemeChange }) {
  const [radioEnabled, setRadioEnabled] = useState(null)
  const [sfxEnabled, setSfxEnabled] = useState(null)

  useEffect(() => {
    getSetting('radioEnabled', true).then(setRadioEnabled)
    getSetting('sfxEnabled', true).then(setSfxEnabled)
  }, [])

  if (radioEnabled === null || sfxEnabled === null) {
    return <p className="empty-state">Yükleniyor...</p>
  }

  async function toggleRadio() {
    const next = !radioEnabled
    setRadioEnabled(next)
    await setSetting('radioEnabled', next)

    if (next) {
      const starter = RADIO_STARTERS[activeThemeId]
      if (starter) starter()
    } else {
      stopRadio()
    }
  }

  async function toggleSfx() {
    const next = !sfxEnabled
    setSfxEnabled(next)
    await setSetting('sfxEnabled', next)
  }

  async function changeTheme(themeId) {
    stopRadio()
    await setSetting('activeThemeId', themeId)
    onThemeChange(themeId)
  }

  return (
    <div className="settings-list">
      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Radyo Atmosferi</span>
          <span className="hint">Tema müziği ve statik ses</span>
        </div>
        <button className={`toggle-button ${radioEnabled ? 'on' : ''}`} onClick={toggleRadio}>
          {radioEnabled ? 'Açık' : 'Kapalı'}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row-label">
          <span className="title">Ses Efektleri</span>
          <span className="hint">Doğru/yanlış cevap sesleri</span>
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
    </div>
  )
}
