import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import Konva from 'konva'

function resolveDurationVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name)?.trim()
  if (!raw) return fallback
  const seconds = parseFloat(raw)
  return Number.isFinite(seconds) ? seconds : fallback
}

/**
 * Shared Konva.Tween primitive (ANIMATION_ADDENDUM.md §3, Track B).
 * Framer Motion is a DOM library and cannot touch anything drawn to a
 * <canvas>, so every Konva-based renderer (node-graph, array-tree-dual,
 * buckets) animates through this one hook instead of each hand-rolling its
 * own Konva.Tween calls. Attach the returned ref to a react-konva shape or
 * Group and pass the props you want animated — it tweens from whatever the
 * shape is currently showing to the new target, it never snaps, except:
 *
 *  - on first mount, where there's nothing to animate *from* yet (unless
 *    `enterFrom` is given — see below), and
 *  - when `disabled` is true, e.g. a user's OS-level reduced-motion setting.
 *
 * `enterFrom` lets a brand-new shape (a node that didn't exist last render)
 * animate INTO place instead of just appearing — pass the off-position/
 * transparent starting point (e.g. `{ x: target.x - 60, opacity: 0 }`) and
 * this hook snaps to that synchronously on mount, then immediately tweens
 * to the real target. This is what PRD §11.3's "node insertion 0.5s
 * slide-in" spec actually is at the implementation level.
 *
 * Duration defaults to the `--t-insert` design token (0.5s) so canvas
 * animation timing stays in lockstep with the DOM-side motion tokens in
 * tokens.css instead of drifting into its own hardcoded numbers.
 */
export function useNodeTween(target, { duration, easing = Konva.Easings.EaseInOut, enterFrom, disabled = false } = {}) {
  const nodeRef = useRef(null)
  const tweenRef = useRef(null)
  const mountedRef = useRef(false)
  const resolvedDuration = duration ?? resolveDurationVar('--t-insert', 0.5)

  // Keys the tween on the actual tweenable values, not on `target`'s object
  // identity — callers rebuild the target object every render.
  const depKey = JSON.stringify(target)

  useLayoutEffect(() => {
    const node = nodeRef.current
    if (!node) return undefined

    tweenRef.current?.destroy()

    if (!mountedRef.current) {
      mountedRef.current = true
      if (enterFrom && !disabled) {
        node.setAttrs(enterFrom)
        tweenRef.current = new Konva.Tween({ node, duration: resolvedDuration, easing, ...target })
        tweenRef.current.play()
      } else {
        node.setAttrs(target)
      }
      return () => tweenRef.current?.destroy()
    }

    if (disabled) {
      node.setAttrs(target)
      return undefined
    }

    tweenRef.current = new Konva.Tween({ node, duration: resolvedDuration, easing, ...target })
    tweenRef.current.play()

    return () => tweenRef.current?.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey, disabled])

  return nodeRef
}

/**
 * Tracks items that just disappeared from `items` (by `getId`) and keeps
 * rendering them for `holdMs` so a renderer can play an exit animation
 * (fade/slide out) instead of the node just vanishing on the frame its data
 * is removed — React would otherwise unmount it instantly, before any
 * Konva.Tween on the way out ever gets to run.
 *
 * Returns the list of "ghost" items still being held. A renderer maps over
 * `[...items, ...ghosts]`, and drives the ghost's own useNodeTween toward an
 * exit target (e.g. `{ opacity: 0, x: lastX - 60 }`).
 */
export function useExitingGhosts(items, { getId = (item) => item.id, holdMs = 500 } = {}) {
  const [prevItems, setPrevItems] = useState(items)
  const [ghosts, setGhosts] = useState([]) // [{ item, removedAt: number|null }]

  // Render-phase derived-state adjustment (same pattern as useStepPlayer's
  // lesson-swap reset) rather than a useEffect, since diffing `items`
  // against last render's value and reacting to props changing is exactly
  // the case React's docs call out for doing it during render instead.
  // removedAt starts null: Date.now() is impure and can't be called during
  // render, so the actual timestamp gets stamped by the effect below.
  if (items !== prevItems) {
    const currentIds = new Set(items.map(getId))
    const removed = prevItems.filter((item) => !currentIds.has(getId(item)))
    setPrevItems(items)
    if (removed.length) {
      setGhosts((g) => [...g, ...removed.map((item) => ({ item, removedAt: null }))])
    }
  }

  const hasUnstamped = ghosts.some((g) => g.removedAt === null)
  useEffect(() => {
    if (!hasUnstamped) return undefined
    // setState wrapped in a callback (rather than called directly in the
    // effect body) so this reads as "react to an external timer firing"
    // instead of an unconditional cascading render on every commit.
    const id = setTimeout(() => {
      const now = Date.now()
      setGhosts((g) => g.map((entry) => (entry.removedAt === null ? { ...entry, removedAt: now } : entry)))
    }, 0)
    return () => clearTimeout(id)
  }, [hasUnstamped])

  const hasGhosts = ghosts.length > 0
  useEffect(() => {
    if (!hasGhosts) return undefined
    // A single sweep interval prunes expired ghosts, instead of one
    // setTimeout per removed item — avoids re-scheduling every remaining
    // ghost's timer whenever a new one is added.
    const sweep = setInterval(() => {
      const now = Date.now()
      setGhosts((g) => g.filter((entry) => entry.removedAt === null || now - entry.removedAt < holdMs))
    }, 100)
    return () => clearInterval(sweep)
  }, [hasGhosts, holdMs])

  return ghosts.map((g) => g.item)
}
