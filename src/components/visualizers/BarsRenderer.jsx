import { useMemo } from 'react'
import { Group, Rect, Text, Line } from 'react-konva'
import { useContainerSize, ScaledStage } from './useScaledStage.jsx'
import { useNodeTween } from './useNodeTween.js'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

const WIDTH = 640
const BAR_W_RATIO = 0.62
const MAX_BAR_H = 130
const LANE_ROW_H = 150
const TOP_PAD = 44

/**
 * Comparison-sort visualizer (PRD §7's planned `bars` rendererType, never
 * actually built until now — Bubble/Quick/Merge/Shell were shipping through
 * GridRenderer's static stacked-rows view instead of an animated one).
 *
 * A step doesn't move values around by re-sorting an array and re-rendering
 * from scratch; it assigns every value id a `{lane, index}` slot for that
 * step, and BarBox (same one-hook-per-stable-id pattern as SortValueBox in
 * BucketsRenderer / ChainNodeBox in NodeGraphRenderer) tweens position *and*
 * fill color into place. Height never tweens because a value's height is
 * its value, which a sort never changes — only its slot does.
 *
 * Single-lane algorithms (bubble/quick/shell) author `step.order` (array of
 * ids, left to right) same convention as BucketsRenderer's collect steps.
 * Multi-lane algorithms (merge, comparing two source runs into one output)
 * author `step.positions` ({id: {lane, index}}) directly. Either is
 * normalized to a positions map before layout.
 *
 * `roles` (per id, per step) drives fill color — the "relevant to the type
 * of sort" part: a compare pair lights up gold, an in-flight swap lights up
 * red, quicksort's pivot and shell's gap partners get their own markers, a
 * merge's two source lanes stay visually distinct from the output lane, and
 * anything settled goes green. Everything else about a step is just data;
 * the renderer doesn't know or care which algorithm it's drawing.
 */
// Tweens the Rect directly (rather than a wrapping Group) specifically so
// Konva.Tween's built-in color interpolation kicks in on `fill` — it only
// interpolates attrs that live on the tweened node itself, and fill lives
// on the Rect, not a Group around it. That's what makes a role change
// (e.g. default -> compare) a smooth color fade instead of a hard cut, the
// same way x/y becomes a glide instead of a snap.
function Bar({ value, target, colors, label, ringActive }) {
  const rectRef = useNodeTween({
    x: target.x - target.w / 2,
    y: target.y - target.h,
    width: target.w,
    height: target.h,
    fill: target.fill,
  })
  return (
    <Group>
      {ringActive && (
        <Rect x={target.x - target.w / 2 - 4} y={target.y - target.h - 4} width={target.w + 8} height={target.h + 8}
          cornerRadius={6} stroke={colors.ring} strokeWidth={2} listening={false} />
      )}
      <Rect ref={rectRef} x={target.x - target.w / 2} y={target.y - target.h} width={target.w} height={target.h}
        cornerRadius={4} fill={target.fill} />
      <Text x={target.x - target.w / 2} y={target.y - target.h - 18} width={target.w} align="center"
        text={String(value)} fontSize={12} fill={colors.ink} />
      {label && (
        <Text x={target.x - target.w / 2} y={target.y - 16} width={target.w} align="center"
          text={label} fontSize={9} fontStyle="bold" fill="#FFFFFF" />
      )}
    </Group>
  )
}

const ROLE_LABEL = {
  pivot: 'PIVOT',
  'gap-a': 'GAP',
  'gap-b': 'GAP',
}

export default function BarsRenderer({ data, stepIndex = 0, mappingHighlight }) {
  const nodeColor = resolveVar('--ds-node')
  const highlightColor = resolveVar('--ds-highlight')
  const swapColor = resolveVar('--ds-broken')
  const pivotColor = resolveVar('--ds-pointer')
  const sortedColor = resolveVar('--ds-circular-intentional')
  const inkMuted = resolveVar('--ink-muted')

  const [containerRef, containerSize] = useContainerSize({ width: WIDTH, height: 260 })

  const values = data?.values
  const steps = data?.steps

  // Lane count and per-value slot count, scanned across every step (not
  // just the current one) so bar width and stage height stay constant for
  // the whole playthrough — same reasoning as BucketsRenderer's maxStack.
  const { laneCount, n } = useMemo(() => {
    if (!steps?.length) return { laneCount: 1, n: values?.length || 1 }
    let maxLane = 0
    steps.forEach((step) => {
      if (step.positions) {
        Object.values(step.positions).forEach((p) => { if (p.lane > maxLane) maxLane = p.lane })
      }
    })
    return { laneCount: maxLane + 1, n: values?.length || 1 }
  }, [steps, values])

  if (!steps?.length || !values?.length) {
    return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>
  }

  const step = steps[Math.min(Math.max(stepIndex, 0), steps.length - 1)]
  const valueById = {}
  values.forEach((v) => { valueById[v.id] = v.value })
  const maxValue = Math.max(...values.map((v) => v.value), 1)

  const cellW = WIDTH / n
  const barW = cellW * BAR_W_RATIO

  const naturalHeight = TOP_PAD + laneCount * LANE_ROW_H + 20

  // Normalize this step's placement to a flat positions map regardless of
  // which authoring convention (order vs positions) it used.
  const positions = step.positions
    ? step.positions
    : Object.fromEntries((step.order || []).map((id, idx) => [id, { lane: 0, index: idx }]))

  const roles = step.roles || {}
  const colorForRole = (role) => {
    switch (role) {
      case 'compare': return highlightColor
      case 'swap': return swapColor
      case 'pivot': return pivotColor
      case 'gap-a': case 'gap-b': return pivotColor
      case 'merge-left': return nodeColor
      case 'merge-right': return highlightColor
      case 'sorted': return sortedColor
      default: return nodeColor
    }
  }

  const laneLabels = step.laneLabels

  // Gap connector for shell sort — a dashed line between the two ids
  // currently tagged gap-a/gap-b, so the "compare across a distance" idea
  // reads visually instead of just via color.
  const gapIds = Object.entries(roles).filter(([, r]) => r === 'gap-a' || r === 'gap-b').map(([id]) => id)

  const targets = {}
  values.forEach((v) => {
    const p = positions[v.id]
    if (!p) return
    const laneY = TOP_PAD + p.lane * LANE_ROW_H + LANE_ROW_H - 30
    const x = p.index * cellW + cellW / 2
    const h = (valueById[v.id] / maxValue) * MAX_BAR_H
    const role = roles[v.id]
    targets[v.id] = { x, y: laneY, h, w: barW, fill: colorForRole(role), lane: p.lane, label: ROLE_LABEL[role] }
  })

  return (
    <div className="bars-renderer">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <ScaledStage containerSize={containerSize} naturalWidth={WIDTH} naturalHeight={naturalHeight}>
          <Text x={0} y={8} width={WIDTH} align="center" text={step.description} fontSize={13} fill={inkMuted} />

          {laneLabels && laneLabels.map((label, lane) => (
            <Text key={lane} x={4} y={TOP_PAD + lane * LANE_ROW_H - 12} text={label} fontSize={10} fill={inkMuted} />
          ))}

          {step.divider != null && (
            <Line
              points={[
                (step.divider + 0.5) * cellW, TOP_PAD - 4,
                (step.divider + 0.5) * cellW, TOP_PAD + LANE_ROW_H - 8,
              ]}
              stroke={pivotColor}
              strokeWidth={2}
              dash={[6, 4]}
            />
          )}
          {step.dividerLabel && step.divider != null && (
            <Text x={(step.divider + 0.5) * cellW - 30} y={TOP_PAD - 4} width={60} align="center"
              text={step.dividerLabel} fontSize={10} fill={pivotColor} />
          )}

          {gapIds.length === 2 && targets[gapIds[0]] && targets[gapIds[1]] && (
            <Line
              points={[
                targets[gapIds[0]].x, targets[gapIds[0]].y - targets[gapIds[0]].h - 26,
                targets[gapIds[1]].x, targets[gapIds[1]].y - targets[gapIds[1]].h - 26,
              ]}
              stroke={pivotColor}
              strokeWidth={1.5}
              dash={[3, 4]}
            />
          )}

          {values.map((v) => {
            const target = targets[v.id]
            if (!target) return null
            const ringActive = mappingHighlight != null && step.pass != null && mappingHighlight === `pass${step.pass}`
            return <Bar key={v.id} value={v.value} target={target}
              colors={{ ink: inkMuted, ring: highlightColor }} label={target.label} ringActive={ringActive} />
          })}
        </ScaledStage>
      </div>
    </div>
  )
}
