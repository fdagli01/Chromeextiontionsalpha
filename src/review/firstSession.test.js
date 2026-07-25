import { describe, expect, it } from 'vitest'
import {
  FIRST_SESSION_LENGTH,
  SCRIPTED_MENTOR_INDEX,
  SCRIPTED_TRAP_INDEX,
  allowsRandomEncounters,
  forcesMentorLine,
  isFirstSession,
  orderFirstSessionQueue,
} from './firstSession.js'

const RU_TRAP = 'магазин' // a real Russian false friend, see falseFriends.js
const plain = (n, offset = 0) => Array.from({ length: n }, (_, i) => ({ term: `слово${i + offset}` }))

describe('isFirstSession', () => {
  it('covers the opening reviews and then stops', () => {
    expect(isFirstSession(0)).toBe(true)
    expect(isFirstSession(FIRST_SESSION_LENGTH - 1)).toBe(true)
    expect(isFirstSession(FIRST_SESSION_LENGTH)).toBe(false)
    expect(isFirstSession(500)).toBe(false)
  })
})

describe('orderFirstSessionQueue', () => {
  it('pulls a false friend onto the scripted beat for a brand-new player', () => {
    const words = [...plain(6), { term: RU_TRAP }]
    const ordered = orderFirstSessionQueue(words, 'russian', 0)
    expect(ordered[SCRIPTED_TRAP_INDEX].term).toBe(RU_TRAP)
    expect(ordered).toHaveLength(words.length)
  })

  it('accounts for reviews already done, so the beat lands on the right card', () => {
    // Two reviews in, the trap belongs at queue position 1 to still be the
    // fourth card this player has ever seen.
    const words = [...plain(6), { term: RU_TRAP }]
    const ordered = orderFirstSessionQueue(words, 'russian', 2)
    expect(ordered[SCRIPTED_TRAP_INDEX - 2].term).toBe(RU_TRAP)
  })

  it('leaves the queue untouched once the opening is over', () => {
    const words = [...plain(6), { term: RU_TRAP }]
    expect(orderFirstSessionQueue(words, 'russian', FIRST_SESSION_LENGTH)).toBe(words)
  })

  it('leaves the queue untouched when the beat has already passed', () => {
    const words = [...plain(6), { term: RU_TRAP }]
    expect(orderFirstSessionQueue(words, 'russian', SCRIPTED_TRAP_INDEX + 1)).toBe(words)
  })

  it('is a no-op when no false friend is due, rather than reordering blindly', () => {
    const words = plain(6)
    expect(orderFirstSessionQueue(words, 'russian', 0)).toBe(words)
  })

  it('never drops or duplicates a word', () => {
    const words = [{ term: RU_TRAP }, ...plain(5)]
    const ordered = orderFirstSessionQueue(words, 'russian', 0)
    expect(ordered.map((w) => w.term).sort()).toEqual(words.map((w) => w.term).sort())
  })

  it('does not reorder a queue shorter than the beat', () => {
    const words = [{ term: RU_TRAP }, ...plain(1)]
    expect(orderFirstSessionQueue(words, 'russian', 0)).toBe(words)
  })
})

describe('allowsRandomEncounters', () => {
  it('holds every random rare encounter back through the opening', () => {
    expect(allowsRandomEncounters(0)).toBe(false)
    expect(allowsRandomEncounters(FIRST_SESSION_LENGTH - 1)).toBe(false)
    expect(allowsRandomEncounters(FIRST_SESSION_LENGTH)).toBe(true)
  })
})

describe('forcesMentorLine', () => {
  it('fires exactly once, on its beat', () => {
    const fired = Array.from({ length: 20 }, (_, i) => forcesMentorLine(i)).filter(Boolean)
    expect(fired).toHaveLength(1)
    expect(forcesMentorLine(SCRIPTED_MENTOR_INDEX)).toBe(true)
  })

  it('introduces the cast after the trap, not before it', () => {
    expect(SCRIPTED_MENTOR_INDEX).toBeGreaterThan(SCRIPTED_TRAP_INDEX)
    expect(SCRIPTED_MENTOR_INDEX).toBeLessThan(FIRST_SESSION_LENGTH)
  })
})
