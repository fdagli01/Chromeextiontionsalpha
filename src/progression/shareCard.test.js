import { describe, expect, it } from 'vitest'
import { buildShareCard } from './shareCard.js'

describe('buildShareCard', () => {
  it('frames the card in a box and aligns rows', () => {
    const card = buildShareCard({
      title: 'K.G.B. TERMINAL',
      subtitle: 'Weekly Intel',
      rows: [
        ['Reviewed', 42],
        ['Accuracy', '88%'],
      ],
      footer: 'Polyglot Chronicle',
    })
    const lines = card.split('\n')
    // Top and bottom borders present.
    expect(lines[0].startsWith('╔')).toBe(true)
    expect(lines[lines.length - 1].startsWith('╚')).toBe(true)
    // Every content line is the same width (padded box).
    const widths = new Set(lines.map((l) => l.length))
    expect(widths.size).toBe(1)
    // Content is included.
    expect(card).toContain('K.G.B. TERMINAL')
    expect(card).toContain('Reviewed')
    expect(card).toContain('42')
    expect(card).toContain('88%')
  })
})
