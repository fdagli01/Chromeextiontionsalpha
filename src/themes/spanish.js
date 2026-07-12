import { defineTheme } from './base.js'

/**
 * "Frente de Palabras" — the Spanish theme is framed around the Spanish
 * Civil War (1936–39): dispatches from the front, censored press, radio
 * propaganda. Captured vocabulary is modern Spanish; curated trivia ties
 * each word back to the war, mirroring how the Russian theme pairs modern
 * words with Cold War facts.
 */
export const spanishTheme = defineTheme({
  id: 'spanish',
  name: 'Spanish',
  sourceLanguageCode: 'es',
  era: 'Spanish Civil War — Frente de Palabras',
  fontHeading: '"Oswald", "Georgia", sans-serif',
  fontBody: '"Roboto Condensed", "Georgia", sans-serif',
  colors: {
    background: '#1a1410',
    surface: '#2a211a',
    surfaceStrong: '#120d0a',
    primary: '#7a1f1f',
    accent: '#c9a227',
    text: '#e8dfc8',
    textMuted: '#a89577',
    border: '#4a3a28',
    danger: '#d94f3d',
    success: '#5a8f4f',
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
