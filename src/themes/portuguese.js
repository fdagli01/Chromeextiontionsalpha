import { defineTheme } from './base.js'

/**
 * "Casa da Índia" — a static, deliberately calm theme (no level-gated
 * stages, unlike Italian). Where Russian is paranoid and Italian is
 * militant, Portuguese is the quiet third register: a candlelit map room
 * logging a ship's route, not an interrogation or a campaign.
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
