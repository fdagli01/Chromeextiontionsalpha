import { defineTheme } from './base.js'

/**
 * "Casa da Índia" — traces the arc of the Portuguese maritime empire as the
 * player's rank rises: Escola de Sagres (candlelit map room, planning the
 * first voyages) → Rota do Cabo at level 4 (open-ocean teal, the Cape route
 * found) → Império das Especiarias at level 8 (the spice trade's richer
 * gold and cinnabar) → Século de Ouro at level 14 (the empire's opulent
 * peak). Unlike French's session-local tension dial, this is level-gated
 * like Italian's — a permanent, one-way evolution of the archive itself.
 */
export const portugueseTheme = defineTheme({
  id: 'portuguese',
  name: 'Portuguese',
  sourceLanguageCode: 'pt',
  era: 'Age of Discovery / Casa da Índia',
  fontHeading: '"IM Fell English SC", Georgia, serif',
  fontBody: '"EB Garamond", Georgia, serif',
  colors: {
    background: '#0d1b2a',
    surface: '#16293e',
    surfaceStrong: '#081220',
    primary: '#9c7a3c',
    accent: '#e8c56d',
    text: '#f2e8d3',
    textMuted: '#a4906c',
    border: '#2e4560',
    danger: '#c25b45',
    success: '#4da583',
  },
  audio: {
    sfxVariant: 'nautical',
  },
  emblem: '❂',
  terminalName: 'CASA DA ÍNDIA',
  terminalVersion: 'Anno MDVI',
  tagline: 'Arquivo Real de Rotas & Palavras — Lisboa',
  stampSuccessWord: 'REGISTADO',
  stampSuccessFlavor: 'Logged in the ship\'s journal, course is clear.',
  stampFailWord: 'DESVIO',
  stampFailFlavor: 'Compass recalibrated, course corrected.',
  strugglingLabel: 'À DERIVA',
  eyebrowLabel: '⚓ AVISTADO',
  nextButtonLabel: 'PRÓXIMO RUMO →',
  intelLabel: '⚓ DIÁRIO DE BORDO',
  archiveStampLabel: 'ARQUIVO REAL',
  contextMenuTitle: 'Log to the ship\'s journal: "%s"',
  effects: {
    paperTexture: true,
    vignette: true,
    scanlines: false,
    flickerOnError: false,
    stampOnAdd: true,
    watermark: true,
  },
  rankNames: [
    'Grumete',
    'Marinheiro',
    'Gajeiro',
    'Timoneiro',
    'Contramestre',
    'Mestre',
    'Piloto',
    'Capitão-mor',
    'Almirante',
  ],
  stages: [
    {
      id: 'sagres',
      name: 'Escola de Sagres',
      minLevel: 1,
      colors: {},
      emblem: '❂',
    },
    {
      id: 'rota-do-cabo',
      name: 'Rota do Cabo',
      minLevel: 4,
      colors: {
        background: '#0a2233',
        surface: '#123449',
        surfaceStrong: '#061520',
        primary: '#2f8f7c',
        accent: '#d8c27a',
        border: '#2c5a63',
        success: '#3fae8a',
      },
      emblem: '⚓',
    },
    {
      id: 'imperio-especiarias',
      name: 'Império das Especiarias',
      minLevel: 8,
      colors: {
        background: '#1c1408',
        surface: '#2c1f0e',
        surfaceStrong: '#120c04',
        primary: '#b5451f',
        accent: '#e8b23d',
        text: '#f2e2c3',
        textMuted: '#b89a6a',
        border: '#5a3c1a',
      },
      emblem: '🌶',
    },
    {
      id: 'seculo-de-ouro',
      name: 'Século de Ouro',
      minLevel: 14,
      colors: {
        background: '#160f04',
        surface: '#241a08',
        surfaceStrong: '#0d0902',
        primary: '#c9922f',
        accent: '#f2d27a',
        text: '#f7ecd0',
        border: '#6b4e1e',
        success: '#c9a227',
      },
      emblem: '👑',
    },
  ],
  crises: [
    {
      id: 'pt-storm',
      headline: 'A storm bears down on the fleet!',
      directive: 'Log 5 terms in 60 seconds before the squall hits.',
      wordCount: 5,
      timeLimitSec: 60,
      rewardXp: 40,
    },
    {
      id: 'pt-sighting',
      headline: 'Sail sighted on the horizon!',
      directive: 'Confirm 3 terms in 30 seconds — friend or corsair?',
      wordCount: 3,
      timeLimitSec: 30,
      rewardXp: 25,
    },
  ],
})
