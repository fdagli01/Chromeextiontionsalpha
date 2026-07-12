import { defineTheme } from './base.js'

/**
 * "Castra Aeterna" — the Italian theme is framed around Rome's rise from a
 * legion camp to an empire. Its signature mechanic: the palette and emblem
 * actually evolve as the player levels up (see `stages`), unlike the static
 * Russian theme. Captured vocabulary is modern Italian; the curated trivia
 * ties each word back to its Roman-history root, mirroring how the Russian
 * theme pairs modern words with Cold War facts.
 *
 * Palette: a sunlit fresco/marble villa rather than a dim night camp —
 * warm travertine background, Pompeian-red chrome, bronze borders, laurel
 * green for success. The stages still darken toward "Late Period" at
 * level 14+ as a deliberate narrative turn (decline), not the baseline.
 */
export const italianTheme = defineTheme({
  id: 'italian',
  name: 'Italian',
  sourceLanguageCode: 'it',
  era: 'The Rise of Rome — Legion Campaign',
  fontHeading: '"Cinzel", "Georgia", serif',
  fontBody: '"Alegreya Sans SC", "Georgia", serif',
  colors: {
    background: '#e6d2a0',
    surface: '#f2e6c4',
    surfaceStrong: '#6b1512',
    primary: '#a8341f',
    accent: '#d4a72c',
    text: '#2a1810',
    textMuted: '#6b4a30',
    border: '#b8905a',
    danger: '#c23a2a',
    success: '#3d6b2f',
  },
  audio: {
    sfxVariant: 'legion',
  },
  emblem: '🗡',
  terminalName: 'PRAETORIVM',
  terminalVersion: 'LEG. XIV',
  tagline: 'CASTRA VERBORVM — LEGIO {level}',
  stampSuccessWord: 'VICTORIA',
  stampSuccessFlavor: 'The legion cheers for you.',
  stampFailWord: 'PERIIT',
  stampFailFlavor: 'The scout has fallen — drill ordered again.',
  strugglingLabel: 'DESERTOR',
  eyebrowLabel: '⚔ HOSTIS CAPTUS',
  nextButtonLabel: 'PERGE [ENTER] →',
  intelLabel: '⚔ COMMENTARII',
  archiveStampLabel: 'SIGNATVM',
  contextMenuTitle: 'Italian/Latin — Inscribe in the commentarii: "%s"',
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
      name: 'Kingdom',
      minLevel: 1,
      colors: {},
      emblem: '🗡',
    },
    {
      id: 'republic',
      name: 'Republic',
      minLevel: 4,
      colors: {
        primary: '#9e2418',
        accent: '#d4a72c',
        background: '#ecdaad',
        surface: '#f5ecd2',
        border: '#a67c3d',
      },
      emblem: '⚔',
    },
    {
      id: 'empire',
      name: 'Empire',
      minLevel: 8,
      colors: {
        // Peak of the arc: whiter marble, imperial Tyrian purple alongside
        // gold — emperors alone wore purple, so it reads as a status jump.
        primary: '#9e1b1b',
        accent: '#7a3d8c',
        background: '#f0e6cc',
        surface: '#f7f0dc',
        surfaceStrong: '#3a1530',
        border: '#c9a227',
        success: '#3d6b2f',
      },
      emblem: '🦅',
    },
    {
      id: 'decline',
      name: 'Late Period',
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
  crises: [
    {
      id: 'it-barbarians',
      headline: 'Barbarians at the gates!',
      directive: 'Name 5 words in 60 seconds before the wall is breached.',
      wordCount: 5,
      timeLimitSec: 60,
      rewardXp: 40,
    },
    {
      id: 'it-ambush',
      headline: 'Ambush on the Via Appia!',
      directive: 'Recall 3 words in 30 seconds to rally the cohort.',
      wordCount: 3,
      timeLimitSec: 30,
      rewardXp: 25,
    },
  ],
})
