import { useMemo, useState } from 'react'
import { Group, Rect, Text } from 'react-konva'
import { useContainerSize, ScaledStage } from './useScaledStage.jsx'
import { useNodeTween } from './useNodeTween.js'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

const WIDTH = 640
const CELL_W = WIDTH / 10
const ARRAY_ROW_Y = 50
const BUCKET_TOP = 118
const ITEM_H = 34
const BOX_W = 48
const BOX_H = 28
const ARRAY_ITEM_GAP = 90

/**
 * One value box in the radix-sort animation (ANIMATION_ADDENDUM.md §5.2).
 * Split into its own component, same reason as ChainNodeBox in
 * NodeGraphRenderer — useNodeTween needs one hook call per stable id, which
 * only works from inside a component mounted once per id, not inline in a
 * .map() in the parent.
 */
function SortValueBox({ entry, target, colors }) {
  const groupRef = useNodeTween({ x: target.x, y: target.y, opacity: 1 })
  return (
    <Group ref={groupRef}>
      <Rect x={-BOX_W / 2} y={-BOX_H / 2} width={BOX_W} height={BOX_H} fill={colors.nodeColor} cornerRadius={4} />
      <Text x={-BOX_W / 2} y={-8} width={BOX_W} align="center" text={String(entry.value)} fontSize={12} fill="#FFFFFF" />
    </Group>
  )
}

/**
 * One digit-bucket column outline. Previously the parent only rendered
 * these 10 columns at all on 'distribute' steps (`showBuckets && ...`),
 * which meant every collect step unmounted them outright — the whole
 * bucket grid popped out of existence on one frame and back into existence
 * fully-formed on the next 'distribute' step, with the value boxes tweening
 * smoothly through that hard cut the entire time. That mismatch is the
 * "empty frame" — a beat where the canvas visibly loses/regains a chunk of
 * its layout with no transition, while everything else is animating.
 * Mounting the column always and tweening its opacity between 1 and 0
 * (same duration/easing as the value boxes' own tween) fixes it: the
 * buckets now fade out from under the boxes as they collect, and fade back
 * in as the next pass starts distributing, in lockstep with everything else.
 */
function BucketColumn({ x, width, height, y, stroke, strokeWidth, digitLabel, digitLabelX, digitLabelWidth, digitY, inkMuted, visible }) {
  const groupRef = useNodeTween({ opacity: visible ? 1 : 0 })
  return (
    <Group ref={groupRef}>
      <Rect x={x} y={y} width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={6} />
      <Text x={digitLabelX} y={digitY} width={digitLabelWidth} align="center" text={digitLabel} fontSize={11} fill={inkMuted} />
    </Group>
  )
}

/**
 * Radix sort's distribute/collect animation (PRD §8.5 — `visual.data` holds
 * an array of values plus a step log for the animation to play through,
 * rather than node/edge data). Values keep a stable id across every step
 * (ANIMATION_ADDENDUM.md §8) so useNodeTween can glide the same on-canvas
 * box from the array row down into its digit bucket, and back up again on
 * collect, instead of the whole scene re-rendering from scratch each step.
 *
 * data: { values: [{id, value}], steps: [...] } — see 6.5.json for the
 * exact step shape (initial / distribute / collect entries).
 * stepIndex: which step to render (driven by Phase3Visual's StepPlayer).
 * mappingHighlight: "p<N>-bucket<d>" (1-indexed pass number) outlines that
 * pass's digit-bucket column, same convention as the old static view used.
 */
export default function BucketsRenderer({ data, stepIndex = 0, mappingHighlight }) {
  const nodeColor = resolveVar('--ds-node')
  const inkMuted = resolveVar('--ink-muted')
  const highlightColor = resolveVar('--ds-highlight')
  const nullColor = resolveVar('--ds-null')
  const [containerRef, containerSize] = useContainerSize({ width: WIDTH, height: 260 })
  const [committedTargets, setCommittedTargets] = useState({})

  const steps = data?.steps
  const values = data?.values

  // Fixed across every step (not just the current one) so the stage's
  // natural height — and therefore its scale — never jumps mid-animation
  // just because a later pass happens to stack more values into one bucket.
  const maxStack = useMemo(() => {
    if (!steps) return 1
    return steps.reduce((max, step) => {
      if (step.type !== 'distribute') return max
      const counts = Object.values(step.buckets || {}).map((chain) => chain.length)
      return Math.max(max, ...counts, 1)
    }, 1)
  }, [steps])

  if (!steps?.length || !values?.length) {
    return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>
  }

  const naturalHeight = Math.max(260, BUCKET_TOP + maxStack * ITEM_H + 30)
  const step = steps[Math.min(Math.max(stepIndex, 0), steps.length - 1)]
  const colors = { nodeColor }

  // Where each value id sits for the *current* step — the only thing that
  // changes render to render. The id -> React component mapping (and its
  // useNodeTween instance underneath) stays put across every step, which is
  // what lets a value glide between array row and bucket column instead of
  // being torn down and recreated at a new spot.
  const targets = {}
  if (step.type === 'distribute') {
    Object.entries(step.buckets || {}).forEach(([digit, chain]) => {
      const x = Number(digit) * CELL_W + CELL_W / 2
      chain.forEach((id, i) => {
        targets[id] = { x, y: BUCKET_TOP + i * ITEM_H + ITEM_H / 2 }
      })
    })
  } else {
    (step.order || []).forEach((id, i) => {
      targets[id] = { x: 70 + i * ARRAY_ITEM_GAP, y: ARRAY_ROW_Y }
    })
  }

  // Defensive carry-forward: if a step's authored data ever omits a value's
  // id (a gap in `buckets`/`order`), it keeps gliding toward its last known
  // committed spot instead of blinking out for that frame. See BucketColumn's
  // comment above for the other half of the "empty frame" fix. Done as a
  // render-phase state adjustment (same documented pattern useStepPlayer uses
  // for its own reset-on-prop-change above) rather than a ref, since reading/
  // writing a ref's `.current` during render is unsafe.
  let targetsChanged = false
  const mergedTargets = { ...committedTargets }
  values.forEach((entry) => {
    const real = targets[entry.id]
    if (real) {
      const prev = committedTargets[entry.id]
      if (!prev || prev.x !== real.x || prev.y !== real.y) targetsChanged = true
      mergedTargets[entry.id] = real
    } else if (committedTargets[entry.id]) {
      targets[entry.id] = committedTargets[entry.id]
    }
  })
  if (targetsChanged) setCommittedTargets(mergedTargets)

  const showBuckets = step.type === 'distribute'

  return (
    <div className="buckets-renderer">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <ScaledStage containerSize={containerSize} naturalWidth={WIDTH} naturalHeight={naturalHeight}>
          <Text x={0} y={8} width={WIDTH} align="center" text={step.description} fontSize={13} fill={inkMuted} />

          {Array.from({ length: 10 }, (_, d) => {
            const x = d * CELL_W
            const active = showBuckets && mappingHighlight === `p${step.pass}-bucket${d}`
            return (
              <BucketColumn
                key={d}
                x={x + 4}
                y={BUCKET_TOP - 20}
                width={CELL_W - 8}
                height={maxStack * ITEM_H + 24}
                stroke={active ? highlightColor : nullColor}
                strokeWidth={active ? 3 : 1}
                digitLabel={String(d)}
                digitLabelX={x}
                digitLabelWidth={CELL_W}
                digitY={BUCKET_TOP - 36}
                inkMuted={inkMuted}
                visible={showBuckets}
              />
            )
          })}

          {values.map((entry) => {
            const target = targets[entry.id]
            if (!target) return null
            return <SortValueBox key={entry.id} entry={entry} target={target} colors={colors} />
          })}
        </ScaledStage>
      </div>
    </div>
  )
}
