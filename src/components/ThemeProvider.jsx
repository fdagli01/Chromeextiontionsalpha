import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getTheme } from '../themes/index.js'
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
 */
export function ThemeProvider({ themeId, children }) {
  const theme = getTheme(themeId)

  // Boots the popup in with a brief terminal-flicker, like a monitor powering on
  const [booted, setBooted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setBooted(true), 180)
    return () => clearTimeout(id)
  }, [])

  const style = useMemo(
    () => ({
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-surface-strong': theme.colors.surfaceStrong,
      '--color-primary': theme.colors.primary,
      '--color-accent': theme.colors.accent,
      '--color-text': theme.colors.text,
      '--color-text-muted': theme.colors.textMuted,
      '--color-border': theme.colors.border,
      '--color-danger': theme.colors.danger,
      '--color-success': theme.colors.success,
      '--font-heading': theme.fontHeading,
      '--font-body': theme.fontBody,
    }),
    [theme]
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

  return (
    <ThemeContext.Provider value={theme}>
      <div className={effectClasses} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
