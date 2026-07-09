import { useState } from 'react'
import { useThemeConfig } from './ThemeProvider.jsx'
import { getChannelCount, getCurrentChannel, isRadioPlaying, nextChannel, pauseRadio, playRadio } from '../audio/radioPlayer.js'
import './RadioBar.css'

const SUPPORTED_THEMES = new Set(['russian'])

export function RadioBar() {
  const theme = useThemeConfig()
  const [playing, setPlaying] = useState(isRadioPlaying())
  const [channel, setChannel] = useState(getCurrentChannel())

  if (!SUPPORTED_THEMES.has(theme.id)) return null

  function toggle() {
    if (playing) {
      pauseRadio()
    } else {
      playRadio()
    }
    setPlaying(!playing)
    setChannel(getCurrentChannel())
  }

  function switchChannel() {
    nextChannel()
    setChannel(getCurrentChannel())
    setPlaying(true)
  }

  return (
    <div className="radio-bar">
      <button className={`radio-toggle ${playing ? 'on' : ''}`} onClick={toggle}>
        📻 {playing ? `YAYINDA · CH-${channel}` : `RADYO KAPALI`}
      </button>
      <button className="radio-next" onClick={switchChannel} title={`${getChannelCount()} frekans arasında geç`}>
        ⏭
      </button>
    </div>
  )
}
