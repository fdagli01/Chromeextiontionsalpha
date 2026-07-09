import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getTheme, resolveThemeVisuals } from '../themes/index.js'
import { getProgress } from '../db/progressRepo.js'
import { onProgressChanged } from '../xp/progressEvents.js'
import '../styles/fonts.css'
import '../styles/effects.css'

const ThemeContext = createContext(null)

export function useThemeConfig() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeConfig must be used within a ThemeProvider')
  return ctx
}

/**
 * Applies a theme's palette as CSS custom properties and toggles its visual
 * effect classes, then makes the resolved theme config available via context
 * so any descendant (radio player, review card, archive list) can read it.
 * Tracks the player's level for this theme so themes with a `stages` array
 * (e.g. the Italian Roman evolution) re-resolve their colors/emblem live —
 * both on mount and whenever a review changes XP (via progressEvents).
 */
export function ThemeProvider({ themeId, children }) {
  const theme = getTheme(themeId)
  const [level, setLevel] = useState(1)

  // Boots the popup in with a brief terminal-flicker, like a monitor powering on
  const [booted, setBooted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setBooted(true), 180)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    getProgress(theme.id).then((progress) => {
      if (!cancelled) setLevel(progress.level)
    })
    const unsubscribe = onProgressChanged(theme.id, (progress) => setLevel(progress.level))
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [theme.id])

  const visuals = useMemo(() => resolveThemeVisuals(theme, level), [theme, level])

  const style = useMemo(
    () => ({
      '--color-background': visuals.colors.background,
      '--color-surface': visuals.colors.surface,
      '--color-surface-strong': visuals.colors.surfaceStrong,
      '--color-primary': visuals.colors.primary,
      '--color-accent': visuals.colors.accent,
      '--color-text': visuals.colors.text,
      '--color-text-muted': visuals.colors.textMuted,
      '--color-border': visuals.colors.border,
      '--color-danger': visuals.colors.danger,
      '--color-success': visuals.colors.success,
      '--font-heading': theme.fontHeading,
      '--font-body': theme.fontBody,
    }),
    [visuals, theme]
  )

  const effectClasses = [
    'theme-root',
    theme.effects.paperTexture && 'fx-paper-texture',
    theme.effects.vignette && 'fx-vignette',
    theme.effects.scanlines && 'fx-scanlines',
    !booted && 'fx-flicker',
  ]
    .filter(Boolean)
    .join(' ')

  const contextValue = useMemo(
    () => ({ ...theme, colors: visuals.colors, emblem: visuals.emblem, level, stageName: visuals.stageName }),
    [theme, visuals, level]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={effectClasses} style={style}>
        {theme.effects.watermark && <div className="theme-watermark">{visuals.emblem ?? '☭'}</div>}
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
