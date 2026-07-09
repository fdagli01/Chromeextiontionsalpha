import { defineTheme } from './base.js'

/**
 * "Casa da Índia" — a static, deliberately calm theme (no level-gated
 * stages, unlike Italian). Where Russian is paranoid and Italian is
 * militant, Portuguese is the quiet third register: a candlelit map room
 * logging a ship's route, not an interrogation or a campaign.
 */
export const portugueseTheme = defineTheme({
  id: 'portuguese',
  name: 'Portekizce',
  sourceLanguageCode: 'pt',
  era: 'Keşifler Çağı / Casa da Índia',
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
  stampSuccessFlavor: 'Seyir defterine işlendi, rota açık.',
  stampFailWord: 'DESVIO',
  stampFailFlavor: 'Pusula yeniden ayarlandı, rota düzeltildi.',
  strugglingLabel: 'À DERIVA',
  eyebrowLabel: '⚓ AVISTADO',
  nextButtonLabel: 'PRÓXIMO RUMO →',
  intelLabel: '⚓ DIÁRIO DE BORDO',
  archiveStampLabel: 'ARQUIVO REAL',
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
})
