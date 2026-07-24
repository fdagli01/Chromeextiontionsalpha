import { useCallback, useState } from 'react'

/**
 * Every piece of per-answer feedback the review screen shows: XP, badges,
 * quest/shield/faction/intercept/fragment/ally toasts, the mentor line,
 * the level-up banner, and the narrative result panels.
 *
 * These were thirteen separate `useState` calls reset by hand in two
 * places that had already drifted apart from each other — each new
 * feedback type risked being cleared in one place and left stale in the
 * other. Grouping them behind one `reset()` makes the whole set
 * impossible to half-clear.
 */
export function useAnswerFeedback() {
  const [xpToast, setXpToast] = useState('')
  const [badgeToast, setBadgeToast] = useState(null)
  const [questToast, setQuestToast] = useState(false)
  const [shieldToast, setShieldToast] = useState(false)
  const [interceptToast, setInterceptToast] = useState(null)
  const [interceptOutcomeToast, setInterceptOutcomeToast] = useState(null)
  const [doubleAgentResult, setDoubleAgentResult] = useState(null)
  const [contrabandSaleToast, setContrabandSaleToast] = useState(null)
  const [fragmentToast, setFragmentToast] = useState(null)
  const [allyToast, setAllyToast] = useState(null)
  const [factionToast, setFactionToast] = useState(null)
  const [mentorLine, setMentorLine] = useState(null)
  const [levelUpInfo, setLevelUpInfo] = useState(null)

  const reset = useCallback(() => {
    setXpToast('')
    setBadgeToast(null)
    setQuestToast(false)
    setShieldToast(false)
    setInterceptToast(null)
    setInterceptOutcomeToast(null)
    setDoubleAgentResult(null)
    setContrabandSaleToast(null)
    setFragmentToast(null)
    setAllyToast(null)
    setFactionToast(null)
    setMentorLine(null)
    setLevelUpInfo(null)
  }, [])

  return {
    xpToast, setXpToast,
    badgeToast, setBadgeToast,
    questToast, setQuestToast,
    shieldToast, setShieldToast,
    interceptToast, setInterceptToast,
    interceptOutcomeToast, setInterceptOutcomeToast,
    doubleAgentResult, setDoubleAgentResult,
    contrabandSaleToast, setContrabandSaleToast,
    fragmentToast, setFragmentToast,
    allyToast, setAllyToast,
    factionToast, setFactionToast,
    mentorLine, setMentorLine,
    levelUpInfo, setLevelUpInfo,
    reset,
  }
}
