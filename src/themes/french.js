import { defineTheme } from './base.js'

/**
 * "La Terreur" — the French theme's signature mechanic is orthogonal to
 * Italian's level-gated stages: it's an ephemeral, session-local tension
 * dial (see `tensionLevels`) driven by consecutive review misses within the
 * current sitting, not by player level. A review session opens calm
 * ("Versailles") and escalates toward "La Terreur" as wrong answers pile
 * up, cooling back down with correct ones. Resolved via
 * resolveTensionVisuals and applied only within ReviewScreen.
 */
export const frenchTheme = defineTheme({
  id: 'french',
  name: 'Fransızca',
  sourceLanguageCode: 'fr',
  era: 'Fransız Devrimi — Tribunal Salonu',
  fontHeading: '"Cormorant Garamond", Georgia, serif',
  fontBody: '"EB Garamond", Georgia, serif',
  colors: {
    background: '#f4e9d4',
    surface: '#fdf6e6',
    surfaceStrong: '#1f3a6e',
    primary: '#2c4d8f',
    accent: '#b8912e',
    text: '#3a2f1e',
    textMuted: '#8a7a5c',
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
  stampSuccessLabel: 'ACQUITTÉ! Magnifique! The Republic remembers her friends.',
  stampFailLabel: 'CONDAMNÉ! To the guillotine — this word returns for trial.',
  strugglingLabel: 'SUSPECT',
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
        accent: '#ad8424',
        text: '#33291a',
        textMuted: '#7d6c4e',
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
})
