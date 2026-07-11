import { defineTheme } from './base.js'

/**
 * "La Terreur" — the French theme layers two orthogonal visual systems:
 *
 * 1. `stages` — level-gated palette evolution tracing the Revolution's
 *    arc as the player's rank rises: Ancien Régime (royal cream & blue) →
 *    La République (tricolor clarity) → Le Comité (ink and wax-seal red) →
 *    L'Empire (Napoleonic green & gold). Applied everywhere via
 *    resolveThemeVisuals, exactly like the Italian theme's stages.
 * 2. `tensionLevels` — an ephemeral, session-local tension dial driven by
 *    consecutive review misses within the current sitting, not by player
 *    level. A session opens calm ("Versailles") and escalates toward
 *    "La Terreur" as wrong answers pile up, cooling back down with correct
 *    ones. Resolved via resolveTensionVisuals, ReviewScreen only.
 */
export const frenchTheme = defineTheme({
  id: 'french',
  name: 'French',
  sourceLanguageCode: 'fr',
  era: 'French Revolution — Tribunal Chamber',
  fontHeading: '"Cormorant Garamond", Georgia, serif',
  fontBody: '"EB Garamond", Georgia, serif',
  colors: {
    background: '#f4e9d4',
    surface: '#fdf6e6',
    surfaceStrong: '#1f3a6e',
    primary: '#2c4d8f',
    accent: '#8f6d1c',
    text: '#3a2f1e',
    textMuted: '#5f4e33',
    border: '#d6c294',
    danger: '#a11f2a',
    success: '#4c7a3d',
  },
  audio: {
    sfxVariant: 'revolution',
  },
  emblem: '⚜',
  terminalName: 'TRIBUNAL RÉVOLUTIONNAIRE',
  terminalVersion: 'An II',
  tagline: 'Liberté, Égalité, Vocabulaire',
  stampSuccessWord: 'ACQUITTÉ',
  stampSuccessFlavor: 'The Republic does not forget its friends.',
  stampFailWord: 'CONDAMNÉ',
  stampFailFlavor: 'Sent to the guillotine — the word will be retried.',
  strugglingLabel: 'SUSPECT',
  eyebrowLabel: '⚖ ACCUSÉ',
  nextButtonLabel: 'AU SUIVANT [ENTER] →',
  intelLabel: '⚖ DOSSIER',
  archiveStampLabel: "ARCHIVES D'ÉTAT",
  contextMenuTitle: 'File before the tribunal: "%s"',
  effects: {
    paperTexture: false,
    vignette: true,
    scanlines: false,
    flickerOnError: true,
    stampOnAdd: true,
    watermark: true,
  },
  rankNames: [
    'Sujet',
    'Citoyen',
    'Sans-Culotte',
    'Garde National',
    'Jacobin',
    'Député',
    'Juré du Tribunal',
    'Membre du Comité',
    "L'Incorruptible",
  ],
  stages: [
    {
      id: 'ancien-regime',
      name: 'Ancien Régime',
      minLevel: 1,
      colors: {},
      emblem: '⚜',
    },
    {
      id: 'republique',
      name: 'La République',
      minLevel: 4,
      colors: {
        background: '#f6f1e2',
        surface: '#fcf8ec',
        surfaceStrong: '#17356b',
        primary: '#1f4f9e',
        accent: '#b02330',
        border: '#c9c0a6',
        textMuted: '#55503e',
      },
      emblem: '⚑',
    },
    {
      id: 'comite',
      name: 'Le Comité',
      minLevel: 8,
      colors: {
        background: '#ece0c2',
        surface: '#f4ead0',
        surfaceStrong: '#101b36',
        primary: '#26365c',
        accent: '#8f1d26',
        text: '#2c2415',
        textMuted: '#5a4a2e',
        border: '#b39b6d',
      },
      emblem: '⚖',
    },
    {
      id: 'empire',
      name: "L'Empire",
      minLevel: 14,
      colors: {
        background: '#eee7d0',
        surface: '#f5efdb',
        surfaceStrong: '#1e3a26',
        primary: '#2f5d3a',
        accent: '#a8862a',
        border: '#c2b284',
        success: '#4c7a3d',
      },
      emblem: '🐝',
    },
  ],
  tensionLevels: [
    {
      name: 'Versailles',
      emblem: '⚜',
      colors: {},
    },
    {
      name: 'Les États Généraux',
      emblem: '⚜',
      colors: {
        background: '#e9d9bc',
        surface: '#f3e6ca',
        surfaceStrong: '#24304f',
        primary: '#3c5177',
        accent: '#8f6d1c',
        text: '#33291a',
        textMuted: '#5f4e33',
        border: '#c9b083',
        danger: '#b02330',
        success: '#4c7a3d',
      },
    },
    {
      name: 'La Révolution',
      emblem: '▼',
      fontHeading: '"IM Fell French Canon SC", Georgia, serif',
      colors: {
        background: '#4e3b38',
        surface: '#5f4a44',
        surfaceStrong: '#2b1d1c',
        primary: '#a63a35',
        accent: '#c39b3e',
        text: '#f0e2c8',
        textMuted: '#c0a488',
        border: '#7a5c50',
        danger: '#d84339',
        success: '#7fae6a',
      },
    },
    {
      name: 'La Terreur',
      emblem: '▼',
      fontHeading: '"IM Fell French Canon SC", Georgia, serif',
      colors: {
        background: '#16090b',
        surface: '#241012',
        surfaceStrong: '#0b0405',
        primary: '#d0202e',
        accent: '#aab2bd',
        text: '#f2e3dc',
        textMuted: '#a37f76',
        border: '#58222a',
        danger: '#ff3b47',
        success: '#8fbf6f',
      },
    },
  ],
  crises: [
    {
      id: 'fr-mob',
      headline: 'The mob marches on the Bastille!',
      directive: 'Denounce 5 words in 60 seconds before the gates fall.',
      wordCount: 5,
      timeLimitSec: 60,
      rewardXp: 40,
    },
    {
      id: 'fr-tribunal',
      headline: 'The Tribunal convenes without warning!',
      directive: 'Testify on 3 words in 30 seconds or be condemned.',
      wordCount: 3,
      timeLimitSec: 30,
      rewardXp: 25,
    },
  ],
})
