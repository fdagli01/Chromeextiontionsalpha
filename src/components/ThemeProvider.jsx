import { createContext, useContext, useMemo } from 'react'
import { getTheme } from '../themes/index.js'
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

  const style = useMemo(
    () => ({
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
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
