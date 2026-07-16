import { beforeEach, describe, expect, it } from 'vitest'
import { _resetConnectionForTests } from '../db/connection.js'
import { getProgress } from '../db/progressRepo.js'
import { awardReviewXp, DAILY_QUEST_BONUS_XP, DAILY_QUEST_TARGET } from './xpService.js'
import { QUALITY } from '../srs/fsrs.js'
import { xpRequiredForLevel } from './xp.js'

beforeEach(() => {
  indexedDB = new IDBFactory()
  _resetConnectionForTests()
})

describe('awardReviewXp', () => {
  it('grants XP and starts the streak on first activity', async () => {
    const { progress, xpGained, leveledUp } = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09') })
    expect(xpGained).toBe(10)
    expect(progress.xp).toBe(10)
    expect(progress.streak).toBe(1)
    expect(progress.lastActiveDate).toBe('2026-07-09')
    expect(leveledUp).toBe(false)
  })

  it('reports leveledUp when crossing a level threshold', async () => {
    const threshold = xpRequiredForLevel(2)
    await awardReviewXp('russian', QUALITY.AGAIN, { now: new Date('2026-07-09') })
    const progress = await getProgress('russian')
    // Manually push xp just under the threshold to isolate the crossing review
    const { saveProgress } = await import('../db/progressRepo.js')
    await saveProgress('russian', { xp: threshold - 5 })

    const result = await awardReviewXp('russian', QUALITY.EASY, { now: new Date('2026-07-09') })
    expect(result.progress.xp).toBe(threshold + 10)
    expect(result.leveledUp).toBe(true)
  })

  it('does not increment the streak twice on the same day', async () => {
    await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09T09:00:00Z') })
    const second = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09T18:00:00Z') })
    expect(second.progress.streak).toBe(1)
  })

  it('increments the streak on the following day', async () => {
    await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09') })
    const second = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-10') })
    expect(second.progress.streak).toBe(2)
  })
})

describe('daily quest', () => {
  it('tracks review count toward the target without awarding a bonus early', async () => {
    let result
    for (let i = 0; i < DAILY_QUEST_TARGET - 1; i++) {
      result = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09') })
    }
    expect(result.dailyQuest.current).toBe(DAILY_QUEST_TARGET - 1)
    expect(result.dailyQuest.justCompleted).toBe(false)
    expect(result.xpGained).toBe(10)
  })

  it('awards the bonus exactly once, the moment the target is reached', async () => {
    let last
    for (let i = 0; i < DAILY_QUEST_TARGET; i++) {
      last = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09') })
    }
    expect(last.dailyQuest.justCompleted).toBe(true)
    expect(last.xpGained).toBe(10 + DAILY_QUEST_BONUS_XP)

    const extra = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09') })
    expect(extra.dailyQuest.justCompleted).toBe(false)
    expect(extra.xpGained).toBe(10)
  })

  it('resets the count on a new day', async () => {
    for (let i = 0; i < DAILY_QUEST_TARGET; i++) {
      await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-09') })
    }
    const nextDay = await awardReviewXp('russian', QUALITY.GOOD, { now: new Date('2026-07-10') })
    expect(nextDay.dailyQuest.current).toBe(1)
    expect(nextDay.dailyQuest.justCompleted).toBe(false)
  })
})
