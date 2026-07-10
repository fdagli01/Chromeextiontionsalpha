import { useEffect, useState } from 'react'
import { useThemeConfig } from '../components/ThemeProvider.jsx'
import { getDueWords, getRandomWords, getWordsByTheme, reviewWord } from '../db/wordsRepo.js'
import { resolveCrisis } from '../db/crisesRepo.js'
import { awardBonusXp } from '../xp/xpService.js'
import { QUALITY } from '../sm2/sm2.js'
import './CrisisScreen.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * A timed, in-world emergency drill — an alternative to a bland "N words
 * due" reminder. The player must correctly recall `wordCount` words before
 * the countdown ends; a single wrong answer or timeout ends the crisis. On
 * mount, pulls together a word pool (due words first, backfilled from the
 * full archive) and runs its own second-by-second timer.
 * @param {{crisis: {themeId: string, templateId: string, crisisRecordId: number}, onResolve: (outcome: 'won'|'lost'|'expired') => void}} props
 */
export function CrisisScreen({ crisis, onResolve }) {
  const theme = useThemeConfig()
  const template = (theme.crises ?? []).find((t) => t.id === crisis.templateId)

  const [queue, setQueue] = useState(null)
  const [options, setOptions] = useState([])
  const [score, setScore] = useState(0)
  const [remaining, setRemaining] = useState(template?.timeLimitSec ?? 0)
  const [outcome, setOutcome] = useState(null)

  useEffect(() => {
    if (!template) {
      onResolve('expired')
      return
    }
    let cancelled = false
    async function buildQueue() {
      const due = await getDueWords(theme.id)
      let pool = due.slice(0, template.wordCount)
      if (pool.length < template.wordCount) {
        const all = await getWordsByTheme(theme.id)
        const usedIds = new Set(pool.map((w) => w.id))
        const filler = shuffle(all.filter((w) => !usedIds.has(w.id)))
        pool = [...pool, ...filler].slice(0, template.wordCount)
      }
      if (!cancelled) setQueue(pool)
    }
    buildQueue()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.id])

  const current = queue?.[score]

  useEffect(() => {
    if (!current) return
    let cancelled = false
    getRandomWords(theme.id, current.id, 2).then((distractors) => {
      if (cancelled) return
      setOptions(
        shuffle([
          { label: current.translation || '(no translation)', isCorrect: true },
          ...distractors.map((d) => ({ label: d.translation || '—', isCorrect: false })),
        ])
      )
    })
    return () => {
      cancelled = true
    }
  }, [current?.id, theme.id])

  useEffect(() => {
    if (outcome || !template) return
    if (remaining <= 0) {
      finish('expired', score)
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, outcome])

  async function finish(result, finalScore) {
    if (outcome) return
    setOutcome(result)
    await resolveCrisis(crisis.crisisRecordId, result, finalScore)
    if (result === 'won' && template) {
      await awardBonusXp(theme.id, template.rewardXp)
    }
  }

  async function pick(index) {
    if (outcome || !options[index] || !current) return
    const correct = options[index].isCorrect
    await reviewWord(current.id, correct ? QUALITY.GOOD : QUALITY.AGAIN)

    if (!correct) {
      finish('lost', score)
      return
    }

    const nextScore = score + 1
    if (nextScore >= template.wordCount) {
      setScore(nextScore)
      finish('won', nextScore)
    } else {
      setScore(nextScore)
    }
  }

  if (!template) return null

  if (outcome) {
    return (
      <div className="crisis-wrap crisis-resolved">
        <div className={`crisis-outcome ${outcome}`}>
          {outcome === 'won' ? 'CRISIS RESOLVED' : outcome === 'lost' ? 'CRISIS FAILED' : 'TIME EXPIRED'}
        </div>
        <div className="crisis-outcome-detail">
          {outcome === 'won'
            ? `+${template.rewardXp} XP`
            : `Recalled ${score}/${template.wordCount} before it ended.`}
        </div>
        <button className="crisis-dismiss-btn" onClick={() => onResolve(outcome)}>
          RETURN TO ARCHIVE
        </button>
      </div>
    )
  }

  if (queue === null || !current) {
    return <p className="empty-state">Assembling the response team...</p>
  }

  const isFinalCountdown = remaining <= 5

  return (
    <div className={`crisis-wrap ${isFinalCountdown ? 'crisis-final-countdown' : ''}`}>
      <div className="crisis-headline">⚠ {template.headline}</div>
      <div className="crisis-directive">{template.directive}</div>

      <div className="crisis-hud">
        <span key={remaining} className={`crisis-timer ${isFinalCountdown ? 'urgent' : ''}`}>
          {remaining}s
        </span>
        <span className="crisis-score">
          {score}/{template.wordCount}
        </span>
      </div>

      <div className="crisis-term-card">
        <div className="crisis-term-word">{current.term}</div>
        {current.transliteration && <div className="crisis-term-translit">[ {current.transliteration} ]</div>}
      </div>

      <div className="crisis-options">
        {options.map((opt, i) => (
          <button key={i} className="crisis-option-btn" onClick={() => pick(i)}>
            <span className="option-num">[{i + 1}]</span>
            <span className="option-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
