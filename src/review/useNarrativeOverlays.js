import { useCallback, useEffect, useState } from 'react'
import { getPendingAct } from '../progression/acts.js'
import { getPendingScene } from '../progression/storyScenes.js'
import { getPendingEnding } from '../progression/endings.js'
import { getDeskMementos } from '../progression/mementos.js'

/**
 * The narrative layer's modal queue: act briefings, story scenes, and the
 * ending, plus the desk mementos strip.
 *
 * Ordering is the whole point of grouping these. An act frames the era, so
 * it opens before anything inside it; a scene is a moment inside that era;
 * an ending only exists once every scene is done. And all three wait while
 * onboarding or the daily briefing is up — those are the day's opening
 * rituals — without losing what they were going to show.
 *
 * @param {string} themeId
 * @param {boolean} deferred - something more important is on screen
 */
export function useNarrativeOverlays(themeId, deferred) {
  const [pendingAct, setPendingAct] = useState(null)
  const [storyScene, setStoryScene] = useState(null)
  const [pendingEnding, setPendingEnding] = useState(null)
  const [deskMementos, setDeskMementos] = useState([])

  /**
   * Re-asks what the narrative layer owes the player. Called on mount and
   * again between cards, since an answer can raise trust past a tier line.
   * @param {() => boolean} [isCancelled]
   */
  const refresh = useCallback(
    async (isCancelled = () => false) => {
      const act = await getPendingAct(themeId)
      if (isCancelled()) return
      if (act) setPendingAct(act)

      const scene = await getPendingScene(themeId)
      if (isCancelled()) return
      if (scene) {
        setStoryScene(scene)
        return
      }
      const ending = await getPendingEnding(themeId)
      if (!isCancelled()) setPendingEnding(ending)
    },
    [themeId]
  )

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled
    setPendingAct(null)
    setStoryScene(null)
    setPendingEnding(null)
    refresh(isCancelled)
    getDeskMementos(themeId).then((m) => {
      if (!cancelled) setDeskMementos(m)
    })
    return () => {
      cancelled = true
    }
  }, [themeId, refresh])

  // An act outranks a scene, which outranks an ending; anything deferred
  // stays in state and opens the moment the deferral lifts.
  const visibleAct = deferred ? null : pendingAct
  const visibleScene = deferred || visibleAct ? null : storyScene
  const visibleEnding = deferred || visibleAct || visibleScene ? null : pendingEnding

  return {
    visibleAct,
    visibleScene,
    visibleEnding,
    deskMementos,
    dismissAct: useCallback(() => setPendingAct(null), []),
    dismissScene: useCallback(() => setStoryScene(null), []),
    dismissEnding: useCallback(() => setPendingEnding(null), []),
    refresh,
  }
}
