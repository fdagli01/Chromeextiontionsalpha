import { defineTheme } from './base.js'

/**
 * "Castra Aeterna" — the Italian theme is framed around Rome's rise from a
 * legion camp to an empire. Its signature mechanic: the palette and emblem
 * actually evolve as the player levels up (see `stages`), unlike the static
 * Russian theme. Captured vocabulary is modern Italian; the curated trivia
 * ties each word back to its Roman-history root, mirroring how the Russian
 * theme pairs modern words with Cold War facts.
 */
export const italianTheme = defineTheme({
  id: 'italian',
  name: 'İtalyanca',
  sourceLanguageCode: 'it',
  era: "Roma İmparatorluğu'nun Yükselişi — Lejyon Seferi",
  fontHeading: '"Cinzel", "Georgia", serif',
  fontBody: '"Alegreya Sans SC", "Georgia", serif',
  colors: {
    background: '#151210',
    surface: '#241d16',
    surfaceStrong: '#0f0b08',
    primary: '#8a1c1c',
    accent: '#8a6a3a',
    text: '#e8dcc8',
    textMuted: '#a68a6d',
    border: '#3a2c1e',
    danger: '#c23a2a',
    success: '#8a7230',
  },
  emblem: '🗡',
  terminalName: 'PRAETORIVM',
  terminalVersion: 'LEG. XIV',
  tagline: 'CASTRA VERBORVM — LEGIO {level}',
  stampSuccessWord: 'VICTORIA',
  stampSuccessFlavor: 'Lejyon senin için tezahürat yapıyor.',
  stampFailWord: 'PERIIT',
  stampFailFlavor: 'Keşif düştü — yeniden tatbikat emredildi.',
  strugglingLabel: 'DESERTOR',
  eyebrowLabel: '⚔ HOSTIS CAPTUS',
  nextButtonLabel: 'PERGE [ENTER] →',
  intelLabel: '⚔ COMMENTARII',
  archiveStampLabel: 'SIGNATVM',
  effects: {
    paperTexture: false,
    vignette: true,
    scanlines: false,
    flickerOnError: true,
    stampOnAdd: true,
    watermark: true,
  },
  rankNames: [
    'Tiro',
    'Miles',
    'Decanus',
    'Optio',
    'Centurio',
    'Primus Pilus',
    'Tribunus',
    'Legatus',
    'Imperator',
  ],
  stages: [
    {
      id: 'kingdom',
      name: 'Krallık',
      minLevel: 1,
      colors: {},
      emblem: '🗡',
    },
    {
      id: 'republic',
      name: 'Cumhuriyet',
      minLevel: 4,
      colors: {
        primary: '#9e1b1b',
        accent: '#c9922f',
        surface: '#2a2118',
        border: '#4a3a28',
      },
      emblem: '⚔',
    },
    {
      id: 'empire',
      name: 'İmparatorluk',
      minLevel: 8,
      colors: {
        primary: '#9e1b1b',
        accent: '#d4af37',
        background: '#1c1108',
        surface: '#2e2013',
        border: '#5a4520',
        success: '#c9a227',
      },
      emblem: '🦅',
    },
    {
      id: 'decline',
      name: 'Geç Dönem',
      minLevel: 14,
      colors: {
        primary: '#7a2e28',
        accent: '#6e5a44',
        background: '#100b08',
        surface: '#241c16',
        border: '#3f342a',
        text: '#c9b8a0',
        danger: '#d43a2f',
      },
      emblem: '🦅',
    },
  ],
})
