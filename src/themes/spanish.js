import { defineTheme } from './base.js'

/**
 * "Frente de Palabras" — the Spanish theme is framed around the Spanish
 * Civil War (1936–39): a censored press dispatch office, not a K.G.B.
 * terminal. Two things set it apart from the Russian theme rather than
 * echoing it:
 * 1. A poster/propaganda-print identity — stencil display type over a
 *    typewriter body font, khaki-and-brick-red ink instead of Russian's
 *    near-black/gold surveillance palette.
 * 2. `tensionLevels` — a session-local escalation (like French's, but
 *    independently authored) that pushes the whole screen from "Calma"
 *    toward "Bombardeo" as misses pile up within a sitting. The Russian
 *    theme has no equivalent — it's static throughout.
 * Captured vocabulary is modern Spanish; curated trivia ties each word
 * back to the war.
 */
export const spanishTheme = defineTheme({
  id: 'spanish',
  name: 'Spanish',
  sourceLanguageCode: 'es',
  era: 'Spanish Civil War — Frente de Palabras',
  fontHeading: '"Bebas Neue", "Oswald", sans-serif',
  fontBody: '"Special Elite", "Courier New", monospace',
  colors: {
    background: '#1c1810',
    surface: '#2c2618',
    surfaceStrong: '#100d08',
    primary: '#8a3320',
    accent: '#d98c2b',
    text: '#ece2c8',
    textMuted: '#a89370',
    border: '#4a4028',
    danger: '#e0432c',
    success: '#7a9b52',
  },
  audio: {
    sfxVariant: 'wartime',
  },
  emblem: '★',
  terminalName: 'FRENTE DE PALABRAS',
  terminalVersion: '1936',
  tagline: 'Despacho de Prensa y Propaganda',
  stampSuccessWord: 'APROBADO',
  stampSuccessFlavor: 'Cleared by the censor — word filed.',
  stampFailWord: 'RECHAZADO',
  stampFailFlavor: 'Returned by the censor — try the dispatch again.',
  strugglingLabel: 'DESERTOR',
  eyebrowLabel: '★ COMUNICADO',
  nextButtonLabel: 'SIGUIENTE [ENTER] →',
  intelLabel: '★ EXPEDIENTE',
  archiveStampLabel: 'CENSURADO',
  contextMenuTitle: 'Spanish — Wire it to the front: "%s"',
  effects: {
    paperTexture: true,
    vignette: true,
    scanlines: false,
    flickerOnError: true,
    stampOnAdd: true,
    watermark: true,
  },
  tensionLevels: [
    {
      name: 'Calma',
      emblem: '★',
      colors: {},
    },
    {
      name: 'Alerta',
      emblem: '★',
      colors: {
        background: '#221c12',
        surface: '#32291a',
        surfaceStrong: '#150f09',
        primary: '#9c3a24',
        accent: '#d98c2b',
        text: '#ece2c8',
        textMuted: '#a89370',
        border: '#544628',
        danger: '#e8502f',
        success: '#7a9b52',
      },
    },
    {
      name: 'Movilización',
      emblem: '⚑',
      fontHeading: '"Bebas Neue", "Oswald", sans-serif',
      colors: {
        background: '#2a1a10',
        surface: '#3a2418',
        surfaceStrong: '#180f09',
        primary: '#b1391f',
        accent: '#e0a02e',
        text: '#f2e6c8',
        textMuted: '#c0a37a',
        border: '#634426',
        danger: '#f05436',
        success: '#8fae5e',
      },
    },
    {
      name: 'Bombardeo',
      emblem: '💥',
      fontHeading: '"Bebas Neue", "Oswald", sans-serif',
      colors: {
        background: '#150a06',
        surface: '#26120b',
        surfaceStrong: '#0a0503',
        primary: '#d4321a',
        accent: '#f0b23a',
        text: '#f5e9d0',
        textMuted: '#c99b72',
        border: '#5c2415',
        danger: '#ff4020',
        success: '#a3c46a',
      },
    },
  ],
  rankNames: [
    'Recluta',
    'Miliciano',
    'Corresponsal',
    'Cabo',
    'Sargento',
    'Teniente',
    'Capitán',
    'Comandante',
    'Coronel',
    'General',
  ],
  // Same 4/8/14 thresholds as the Spanish act briefings: the sunlit
  // republic of July 1936, the smoke and ash of the university front, then
  // the cold blue of the road north in the retirada.
  stages: [
    {
      id: 'republica',
      name: 'La República',
      minLevel: 1,
      colors: {},
      emblem: '★',
    },
    {
      id: 'frente',
      name: 'El Frente',
      minLevel: 4,
      colors: {
        background: '#1f1a12',
        surface: '#302818',
        surfaceStrong: '#12100a',
        primary: '#a03a22',
        accent: '#e0a03a',
        border: '#57492c',
      },
      emblem: '✊',
    },
    {
      id: 'asedio',
      name: 'El Asedio',
      minLevel: 8,
      colors: {
        background: '#1a1815',
        surface: '#2a2621',
        surfaceStrong: '#0f0e0c',
        primary: '#8f3524',
        accent: '#c8853a',
        border: '#4a443a',
        textMuted: '#9c9078',
      },
      emblem: '🔥',
    },
    {
      id: 'retirada',
      name: 'La Retirada',
      minLevel: 14,
      colors: {
        background: '#15181c',
        surface: '#222730',
        surfaceStrong: '#0d0f12',
        primary: '#4a6070',
        accent: '#b9c6d2',
        border: '#39414c',
        text: '#e4eaf0',
        textMuted: '#93a0ad',
      },
      emblem: '🕊',
    },
  ],
  crises: [
    {
      id: 'es-siege',
      headline: 'The line is under siege — dispatches piling up!',
      directive: 'Clear 5 words in 60 seconds before the wire goes dead.',
      wordCount: 5,
      timeLimitSec: 60,
      rewardXp: 40,
    },
    {
      id: 'es-blackout',
      headline: 'Radio blackout expected any minute!',
      directive: 'Confirm 3 words in 30 seconds before the signal cuts out.',
      wordCount: 3,
      timeLimitSec: 30,
      rewardXp: 25,
    },
  ],
})
