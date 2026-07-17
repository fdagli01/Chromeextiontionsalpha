import { describe, expect, it } from 'vitest'
import { buildTermRegex } from './matcher.js'

describe('buildTermRegex', () => {
  it('matches a Cyrillic term on real word boundaries only', () => {
    const regex = buildTermRegex(['товарищ'])
    expect('Здравствуйте, товарищ Иванов!'.match(regex)).toEqual(['товарищ'])
    // Inside a longer word (dative "товарищу") it must NOT match — \b would have.
    expect('товарищу'.match(regex)).toBeNull()
  })

  it('is case-insensitive and matches Latin terms at sentence starts', () => {
    const regex = buildTermRegex(['guillotine'])
    expect('Guillotine was used.'.match(regex)).toEqual(['Guillotine'])
    expect('The guillotines.'.match(regex)).toBeNull()
  })

  it('prefers the longest phrase when terms overlap', () => {
    const regex = buildTermRegex(['pasarán', 'no pasarán'])
    expect('¡No pasarán! they cried'.match(regex)).toEqual(['No pasarán'])
  })

  it('escapes regex metacharacters in terms', () => {
    const regex = buildTermRegex(['c++ (test)'])
    expect('learning c++ (test) today'.match(regex)).toEqual(['c++ (test)'])
  })

  it('drops terms shorter than the minimum and returns null when nothing is usable', () => {
    expect(buildTermRegex(['да', 'no'])).toBeNull()
    const regex = buildTermRegex(['да', 'mère'])
    expect('ma mère est là'.match(regex)).toEqual(['mère'])
  })
})
