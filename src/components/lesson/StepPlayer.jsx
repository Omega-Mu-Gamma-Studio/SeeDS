import { useState, useEffect, useRef, useCallback } from 'react'
import './StepPlayer.css'

/**
 * Playback state for a step-through animation (radix sort's distribute/
 * collect passes, a linked-list insert/delete sequence, an AVL rotation,
 * etc). This hook only knows "there are N steps and we're on index i" — it
 * has no idea what a step *means* for any given renderer. That's on purpose:
 * ANIMATION_ADDENDUM.md §4 calls for one step player shared across every
 * renderer type instead of each one inventing its own play/pause/scrub
 * logic, so a 5th renderer type inherits this for free.
 */
export function useStepPlayer(stepCount, { intervalMs = 1100 } = {}) {
  const clampedCount = Math.max(stepCount, 1)
  const [prevCount, setPrevCount] = useState(clampedCount)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  // A lesson swap (different step count) resets playback rather than
  // leaving the scrubber pointed at a step index that no longer exists.
  // Done as a render-phase state adjustment (React's documented pattern for
  // "resetting state when a prop changes") rather than inside a useEffect,
  // since a bare setState call in an effect body triggers a cascading extra
  // render for no benefit here.
  if (clampedCount !== prevCount) {
    setPrevCount(clampedCount)
    setIndex(0)
    setPlaying(false)
  }

  useEffect(() => {
    if (!playing) return undefined
    timerRef.current = setInterval(() => {
      setIndex((i) => {
        if (i >= clampedCount - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [playing, clampedCount, intervalMs])

  const stepForward = useCallback(() => setIndex((i) => Math.min(i + 1, clampedCount - 1)), [clampedCount])
  const stepBack = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])
  const scrubTo = useCallback((i) => setIndex(Math.min(Math.max(i, 0), clampedCount - 1)), [clampedCount])
  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && index >= clampedCount - 1) setIndex(0)
      return !p
    })
  }, [index, clampedCount])

  return { index, playing, stepCount: clampedCount, stepForward, stepBack, scrubTo, togglePlay }
}

export default function StepPlayer({ index, stepCount, playing, stepForward, stepBack, scrubTo, togglePlay, stepLabel }) {
  if (stepCount <= 1) return null

  return (
    <div className="step-player" role="group" aria-label="Step playback controls">
      <button type="button" className="step-player__btn" onClick={stepBack} disabled={index === 0} aria-label="Previous step">
        ⏮
      </button>
      <button type="button" className="step-player__btn step-player__btn--play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶'}
      </button>
      <button type="button" className="step-player__btn" onClick={stepForward} disabled={index === stepCount - 1} aria-label="Next step">
        ⏭
      </button>
      <input
        type="range"
        className="step-player__scrub"
        min={0}
        max={stepCount - 1}
        value={index}
        onChange={(e) => scrubTo(Number(e.target.value))}
        aria-label="Scrub to step"
      />
      <span className="step-player__label">{stepLabel ?? `Step ${index + 1} / ${stepCount}`}</span>
    </div>
  )
}
