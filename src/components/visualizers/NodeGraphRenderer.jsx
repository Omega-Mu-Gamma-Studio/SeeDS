import { useMemo, useState } from 'react'
import { Group, Circle, Line, Text, Rect, Arrow } from 'react-konva'
import { useContainerSize, ScaledStage as SharedScaledStage } from './useScaledStage.jsx'
import { useNodeTween, useExitingGhosts } from './useNodeTween.js'

const NODE_R = 26

// Box-split geometry (ANIMATION_ADDENDUM.md §5.1) — a linked-list node
// rendered as a struct layout instead of an anonymous circle, so
// `struct Node { int value; struct Node* next; }` is legible straight off
// the canvas instead of needing the code panel to explain what's hidden
// inside the dot. Singly nodes get two cells (DATA | NEXT); doubly nodes
// (any node with a `prev` field, per PRD §8.2) get three (PREV | DATA | NEXT).
const BOX_W = 96
const BOX_H = 46
const BOX_GAP = 40

// Resolve CSS custom properties to actual color values Konva can use,
// since Konva can't read var(--x) directly.
function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  const val = getComputedStyle(document.documentElement).getPropertyValue(name)
  return val?.trim() || '#4A90D9'
}

// One struct-layout node in a chain (§5.1). Split into its own component
// (rather than inlined in a .map()) specifically so it can call
// useNodeTween — a hook can't be called conditionally per loop iteration
// inside its parent's render, but a dedicated child component mounted once
// per node.id can call it every time *that instance* renders, which is
// what actually lets an existing node glide to a new x/y instead of
// snapping, and a removed node fade out instead of vanishing (via
// `isGhost`, set by the caller for nodes held post-removal by
// useExitingGhosts).
function ChainNodeBox({ node, target, highlighted, isGhost, colors, onHover }) {
  const isDoubly = 'prev' in node
  const cells = isDoubly
    ? [
        { key: 'prev', label: 'prev', w: BOX_W * 0.3 },
        { key: 'value', label: null, w: BOX_W * 0.4 },
        { key: 'next', label: 'next', w: BOX_W * 0.3 },
      ]
    : [
        { key: 'value', label: null, w: BOX_W * 0.6 },
        { key: 'next', label: 'next', w: BOX_W * 0.4 },
      ]

  const enterFrom = !isGhost ? { x: target.x - (BOX_W + BOX_GAP), y: target.y, opacity: 0 } : undefined
  const tweenTarget = isGhost ? { x: target.x, y: target.y - 20, opacity: 0 } : { x: target.x, y: target.y, opacity: 1 }
  const groupRef = useNodeTween(tweenTarget, { enterFrom })

  const fill = node.broken ? colors.brokenColor : colors.nodeColor
  let cellX = -BOX_W / 2

  return (
    <Group
      ref={groupRef}
      listening={!isGhost}
      onMouseEnter={() => onHover && onHover(node.id)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      {node.address && (
        <Text x={-BOX_W / 2} y={-BOX_H / 2 - 18} width={BOX_W} align="center"
          text={node.address} fontSize={10} fontFamily="monospace" fill={colors.inkMuted} />
      )}
      <Rect x={-BOX_W / 2} y={-BOX_H / 2} width={BOX_W} height={BOX_H}
        fill={fill} stroke={highlighted ? colors.highlightColor : undefined}
        strokeWidth={highlighted ? 3 : 0} cornerRadius={4} />
      {cells.map((cell, i) => {
        const x = cellX
        cellX += cell.w
        const isValueCell = cell.key === 'value'
        return (
          <Group key={cell.key}>
            {i > 0 && <Line points={[x, -BOX_H / 2, x, BOX_H / 2]} stroke={colors.nodeInk} strokeWidth={1} opacity={0.4} />}
            <Text x={x} y={isValueCell ? -6 : -BOX_H / 2 + 4} width={cell.w} align="center"
              text={isValueCell ? String(node.value) : '•'}
              fontSize={isValueCell ? 15 : 13} fill={colors.nodeInk} />
            {cell.label && (
              <Text x={x} y={BOX_H / 2 + 3} width={cell.w} align="center"
                text={cell.label} fontSize={9} fill={colors.inkMuted} />
            )}
          </Group>
        )
      })}
    </Group>
  )
}

/**
 * Handles node-graph data for lists, trees, graphs, and hash tables.
 * Layout strategy is picked from the data shape itself:
 *  - nodes[] with arrayIndex + isTop/isFront/isRear -> stack/queue row
 *  - nodes[] with left/right -> tree layout
 *  - nodes[] with adjacency -> force-ish graph layout (simple circle layout)
 *  - nodes[] with next/prev (no left/right) -> linear chain layout
 *  - buckets[] -> hash chaining layout
 *  - slots[] -> open addressing layout
 */
export default function NodeGraphRenderer({ data, mappingHighlight, onNodeHover }) {
  const width = 640
  const height = 340

  const [containerRef, containerSize] = useContainerSize()

  const ScaledStage = ({ naturalWidth, naturalHeight, children }) => (
    <SharedScaledStage containerSize={containerSize} naturalWidth={naturalWidth} naturalHeight={naturalHeight}>
      {children}
    </SharedScaledStage>
  )

  const nodeColor = resolveVar('--ds-node')
  const nodeInk = resolveVar('--ds-node-ink')
  const pointerColor = resolveVar('--ds-pointer')
  const nullColor = resolveVar('--ds-null')
  const brokenColor = resolveVar('--ds-broken')
  const highlightColor = resolveVar('--ds-highlight')
  const circularColor = resolveVar('--ds-circular-intentional')
  const inkMuted = resolveVar('--ink-muted')

  const positions = useMemo(() => {
    const pos = {}
    if (!data) return pos

    if (data.buckets) {
      data.buckets.forEach((bucket, bi) => {
        const bx = 60
        const by = 30 + bi * 42
        pos[`bucket${bucket.bucketIndex}`] = { x: bx, y: by }
        ;(bucket.chain || []).forEach((n, ci) => {
          pos[n.id] = { x: bx + 90 + ci * 90, y: by }
        })
      })
      return pos
    }

    if (data.slots) {
      data.slots.forEach((slot, i) => {
        pos[`slot${slot.slotIndex}`] = { x: 50 + i * 80, y: 150 }
      })
      return pos
    }

    if (!data.nodes || data.nodes.length === 0) return pos

    const isTree = data.nodes.some((n) => 'left' in n || 'right' in n)
    const isArrayLike = data.nodes.some((n) => 'arrayIndex' in n) && !isTree
    const isGraph = data.nodes.some((n) => Array.isArray(n.adjacency))

    if (isArrayLike) {
      const isStack = data.nodes.some((n) => 'isTop' in n)
      if (isStack) {
        const slotH = 70
        const centerX = 140
        const bottomY = height - 50
        data.nodes.forEach((n) => {
          pos[n.id] = { x: centerX, y: bottomY - n.arrayIndex * slotH }
        })
      } else {
        data.nodes.forEach((n) => {
          pos[n.id] = { x: 60 + n.arrayIndex * 80, y: 150 }
        })
      }
      return pos
    }

    if (isTree) {
      // BFS layout by depth using left/right, root = node with no incoming edge
      const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]))
      const incoming = new Set(data.nodes.flatMap((n) => [n.left, n.right]).filter(Boolean))
      const root = data.nodes.find((n) => !incoming.has(n.id)) || data.nodes[0]
      const levels = []
      function place(id, depth, xMin, xMax) {
        if (!id || !byId[id]) return
        levels[depth] = levels[depth] || []
        const x = (xMin + xMax) / 2
        pos[id] = { x, y: 40 + depth * 80 }
        levels[depth].push(id)
        const node = byId[id]
        place(node.left, depth + 1, xMin, x)
        place(node.right, depth + 1, x, xMax)
      }
      place(root.id, 0, 20, width - 20)
      return pos
    }

    if (isGraph) {
      const n = data.nodes.length
      const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 60
      data.nodes.forEach((node, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        pos[node.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
      })
      return pos
    }

    // linear chain (linked list) — center-to-center spacing sized for the
    // box-split layout (§5.1) instead of the old circle-node spacing.
    data.nodes.forEach((n, i) => {
      pos[n.id] = { x: 70 + i * (BOX_W + BOX_GAP), y: 150 }
    })
    return pos
  }, [data, width, height])

  // Caches every position ever computed (not just this render's), so a node
  // that just got removed — and is therefore no longer in `positions` at
  // all — still has somewhere to animate FROM while it's held as an exiting
  // ghost. Render-phase derived state (comparing `positions`' own memoized
  // reference against last render's) rather than a ref, since `positions`
  // only changes identity when its useMemo deps actually change.
  const [seenPositions, setSeenPositions] = useState(positions)
  const [positionsHistory, setPositionsHistory] = useState(positions)
  if (positions !== seenPositions) {
    setSeenPositions(positions)
    setPositionsHistory((prev) => ({ ...prev, ...positions }))
  }
  const chainGhosts = useExitingGhosts(data?.nodes || [], { holdMs: 500 })

  if (!data) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const isChain = data.nodes && data.nodes.length > 0 &&
    !data.nodes.some((n) => 'left' in n || 'right' in n) &&
    !data.nodes.some((n) => 'arrayIndex' in n) &&
    !data.nodes.some((n) => Array.isArray(n.adjacency))

  const renderBucketView = () => (
    <ScaledStage naturalWidth={width} naturalHeight={Math.max(height, 40 + data.buckets.length * 42)}>
        {data.buckets.map((bucket) => {
          const bp = positions[`bucket${bucket.bucketIndex}`]
          const highlighted = mappingHighlight === `bucket${bucket.bucketIndex}`
          return (
            <Group key={bucket.bucketIndex}>
              <Rect x={bp.x - 40} y={bp.y - 16} width={80} height={32} fill={nullColor} opacity={0.25}
                stroke={highlighted ? highlightColor : undefined} strokeWidth={highlighted ? 3 : 0} cornerRadius={4} />
              <Text x={bp.x - 40} y={bp.y - 8} width={80} align="center" text={`[${bucket.bucketIndex}]`} fontSize={12} fill={nodeInk === '#FFFFFF' ? '#333' : nodeInk} />
              {(bucket.chain || []).map((cn, ci) => {
                const np = positions[cn.id]
                const prevX = ci === 0 ? bp.x + 40 : positions[bucket.chain[ci - 1].id].x + 30
                return (
                  <Group key={cn.id}>
                    <Line points={[prevX, np.y, np.x - 30, np.y]} stroke={pointerColor} strokeWidth={2} />
                    <Circle x={np.x} y={np.y} radius={NODE_R} fill={cn.broken ? brokenColor : nodeColor}
                      stroke={highlighted ? highlightColor : undefined} strokeWidth={highlighted ? 3 : 0} />
                    <Text x={np.x - 25} y={np.y - 8} width={50} align="center" text={String(cn.key ?? cn.value)} fontSize={13} fill={nodeInk} />
                  </Group>
                )
              })}
            </Group>
          )
        })}
    </ScaledStage>
  )

  const renderSlotView = () => (
    <ScaledStage naturalWidth={Math.max(width, 60 + data.slots.length * 80)} naturalHeight={220}>
        {data.slots.map((slot) => {
          const sp = positions[`slot${slot.slotIndex}`]
          const empty = slot.value === null || slot.value === undefined
          const highlighted = mappingHighlight === `slot${slot.slotIndex}`
          return (
            <Group key={slot.slotIndex}>
              <Rect x={sp.x - 30} y={sp.y - 30} width={60} height={60}
                fill={empty ? 'transparent' : (slot.broken ? brokenColor : nodeColor)}
                stroke={highlighted ? highlightColor : nullColor} strokeWidth={highlighted ? 3 : 1.5} cornerRadius={6} />
              <Text x={sp.x - 30} y={sp.y - 46} width={60} align="center" text={`[${slot.slotIndex}]`} fontSize={11} fill={inkMuted} />
              {!empty && (
                <Text x={sp.x - 30} y={sp.y - 8} width={60} align="center" text={String(slot.value)} fontSize={14} fill={nodeInk} />
              )}
            </Group>
          )
        })}
    </ScaledStage>
  )

  const renderArrayLikeView = () => {
    const isStack = data.nodes.some((n) => 'isTop' in n)
    const capacity = data.capacity ?? data.nodes.length
    const size = data.size ?? data.nodes.length

    if (isStack) {
      const slotH = 70
      const slotW = 100
      const naturalWidth = 280
      const centerX = naturalWidth / 2
      const bottomY = height - 50
      const naturalHeight = Math.max(height, 60 + capacity * slotH)

      return (
        <ScaledStage naturalWidth={naturalWidth} naturalHeight={naturalHeight}>
          {/* capacity column, one cell per slot, index 0 at the bottom */}
          {Array.from({ length: capacity }).map((_, i) => (
            <Rect
              key={`slot${i}`}
              x={centerX - slotW / 2}
              y={bottomY - i * slotH - slotH + 10}
              width={slotW}
              height={slotH - 20}
              stroke={nullColor}
              strokeWidth={1.5}
              dash={i >= size ? [4, 4] : undefined}
              cornerRadius={6}
            />
          ))}
          {data.nodes.map((node) => {
            const p = positions[node.id]
            if (!p) return null
            const highlighted = mappingHighlight === node.id
            const fill = node.broken ? brokenColor : nodeColor
            return (
              <Group key={node.id} onMouseEnter={() => onNodeHover && onNodeHover(node.id)} onMouseLeave={() => onNodeHover && onNodeHover(null)}>
                <Circle
                  x={p.x} y={p.y} radius={NODE_R}
                  fill={fill}
                  stroke={highlighted ? highlightColor : undefined}
                  strokeWidth={highlighted ? 4 : 0}
                />
                <Text x={p.x - NODE_R} y={p.y - 8} width={NODE_R * 2} align="center" text={String(node.value)} fontSize={14} fill={nodeInk} />
                <Text x={p.x - slotW / 2 - 34} y={p.y - 7} width={28} align="center" text={`[${node.arrayIndex}]`} fontSize={10} fill={inkMuted} />
                {node.isTop && (
                  <Group>
                    <Line points={[p.x + slotW / 2 + 8, p.y, p.x + slotW / 2 + 30, p.y]} stroke={highlightColor} strokeWidth={2} />
                    <Text x={p.x + slotW / 2 + 34} y={p.y - 7} width={40} text="TOP" fontSize={12} fontStyle="bold" fill={highlightColor} />
                  </Group>
                )}
              </Group>
            )
          })}
        </ScaledStage>
      )
    }

    const slotW = 80
    const naturalWidth = Math.max(width, 60 + capacity * slotW + 20)
    const boxTop = 110
    const boxHeight = 80

    return (
      <ScaledStage naturalWidth={naturalWidth} naturalHeight={height}>
        {/* capacity bounding box, one cell per slot */}
        {Array.from({ length: capacity }).map((_, i) => (
          <Rect
            key={`slot${i}`}
            x={60 + i * slotW - slotW / 2 + 10}
            y={boxTop}
            width={slotW - 20}
            height={boxHeight}
            stroke={nullColor}
            strokeWidth={1.5}
            dash={i >= size ? [4, 4] : undefined}
            cornerRadius={6}
          />
        ))}
        {data.nodes.map((node) => {
          const p = positions[node.id]
          if (!p) return null
          const highlighted = mappingHighlight === node.id
          const fill = node.broken ? brokenColor : nodeColor
          const marker = node.isFront ? 'FRONT' : node.isRear ? 'REAR' : null
          return (
            <Group key={node.id} onMouseEnter={() => onNodeHover && onNodeHover(node.id)} onMouseLeave={() => onNodeHover && onNodeHover(null)}>
              <Circle
                x={p.x} y={boxTop + boxHeight / 2} radius={NODE_R}
                fill={fill}
                stroke={highlighted ? highlightColor : undefined}
                strokeWidth={highlighted ? 4 : 0}
              />
              <Text x={p.x - NODE_R} y={boxTop + boxHeight / 2 - 8} width={NODE_R * 2} align="center" text={String(node.value)} fontSize={14} fill={nodeInk} />
              <Text x={p.x - 30} y={boxTop + boxHeight + 6} width={60} align="center" text={`[${node.arrayIndex}]`} fontSize={10} fill={inkMuted} />
              {marker && (
                <Group>
                  <Line points={[p.x, boxTop - 22, p.x, boxTop - 4]} stroke={highlightColor} strokeWidth={2} />
                  <Text x={p.x - 30} y={boxTop - 40} width={60} align="center" text={marker} fontSize={12} fontStyle="bold" fill={highlightColor} />
                </Group>
              )}
            </Group>
          )
        })}
      </ScaledStage>
    )
  }

  const renderChainBoxView = () => {
    const colors = { nodeColor, nodeInk, inkMuted, highlightColor, brokenColor }
    const naturalWidth = Math.max(width, 70 + data.nodes.length * (BOX_W + BOX_GAP))

    const edgeEls = (data.edges || []).map((edge, i) => {
      const from = positions[edge.from]
      if (!from) return null
      const isBroken = edge.type === 'cyclic-bug' || edge.type === 'null-unexpected' || edge.type === 'violation'
      const isCircular = edge.type === 'next-circular'
      const isPrev = edge.type === 'prev'
      const stroke = isBroken ? brokenColor : isCircular ? circularColor : pointerColor
      // 'next' arrows ride a row above box-center; 'prev' arrows ride a row
      // below, so a doubly-linked list's two pointer directions don't
      // overlap into one illegible line (standard DLL-diagram convention).
      const rowY = from.y + (isPrev ? 14 : -14)
      const fromX = isPrev ? from.x - BOX_W / 2 : from.x + BOX_W / 2

      if (!edge.to) {
        // NULL terminator — next's off the last node, or prev's off the first.
        const dir = isPrev ? -1 : 1
        return (
          <Group key={i}>
            <Line points={[fromX, rowY, fromX + dir * 34, rowY]} stroke={stroke} strokeWidth={2} dash={[4, 4]} />
            <Text x={dir > 0 ? fromX + 6 : fromX - 46} y={rowY - 16} width={40} align="center" text="NULL" fontSize={11} fill={nullColor} fontStyle="bold" />
          </Group>
        )
      }
      const to = positions[edge.to]
      if (!to) return null
      const toX = isPrev ? to.x + BOX_W / 2 : to.x - BOX_W / 2
      return (
        <Arrow key={i} points={[fromX, rowY, toX, rowY]} stroke={stroke} fill={stroke}
          strokeWidth={2} pointerLength={7} pointerWidth={7} />
      )
    })

    const realNodes = data.nodes.map((node) => {
      const p = positions[node.id]
      if (!p) return null
      return (
        <ChainNodeBox key={node.id} node={node} target={p}
          highlighted={mappingHighlight === node.id} colors={colors} onHover={onNodeHover} />
      )
    })

    const ghostNodes = chainGhosts
      .filter((g) => !data.nodes.some((n) => n.id === g.id))
      .map((g) => {
        const p = positionsHistory[g.id]
        if (!p) return null
        return <ChainNodeBox key={g.id} node={g} target={p} isGhost colors={colors} />
      })

    return (
      <ScaledStage naturalWidth={naturalWidth} naturalHeight={height}>
        {edgeEls}
        {realNodes}
        {ghostNodes}
      </ScaledStage>
    )
  }

  const renderNodeEdgeView = () => (
    <ScaledStage naturalWidth={width} naturalHeight={height}>
        {(data.edges || []).map((edge, i) => {
          const from = positions[edge.from]
          const to = edge.to ? positions[edge.to] : null
          if (!from) return null
          const isBroken = edge.type === 'cyclic-bug' || edge.type === 'null-unexpected' || edge.type === 'violation' || edge.type === 'left-wrong' || edge.type === 'right-wrong'
          const isCircular = edge.type === 'next-circular'
          const stroke = isBroken ? brokenColor : isCircular ? circularColor : pointerColor
          if (!to) {
            // NULL terminator
            return (
              <Group key={i}>
                <Line points={[from.x + NODE_R, from.y, from.x + NODE_R + 40, from.y]} stroke={stroke} strokeWidth={2} dash={[4, 4]} />
                <Text x={from.x + NODE_R + 10} y={from.y - 20} text="NULL" fontSize={12} fill={nullColor} fontStyle="bold" />
              </Group>
            )
          }
          return (
            <Arrow
              key={i}
              points={[from.x, from.y, to.x, to.y]}
              stroke={stroke}
              fill={stroke}
              strokeWidth={2}
              pointerLength={8}
              pointerWidth={8}
            />
          )
        })}
        {data.nodes.map((node) => {
          const p = positions[node.id]
          if (!p) return null
          const highlighted = mappingHighlight === node.id
          const fill = node.broken ? brokenColor : nodeColor
          return (
            <Group key={node.id} onMouseEnter={() => onNodeHover && onNodeHover(node.id)} onMouseLeave={() => onNodeHover && onNodeHover(null)}>
              <Circle
                x={p.x} y={p.y} radius={NODE_R}
                fill={fill}
                stroke={highlighted ? highlightColor : undefined}
                strokeWidth={highlighted ? 4 : 0}
              />
              <Text x={p.x - NODE_R} y={p.y - 8} width={NODE_R * 2} align="center" text={String(node.value)} fontSize={14} fill={nodeInk} />
              {'balanceFactor' in node && (
                <Text x={p.x - 12} y={p.y - NODE_R - 16} text={`bf:${node.balanceFactor}`} fontSize={10} fill={inkMuted} />
              )}
            </Group>
          )
        })}
    </ScaledStage>
  )

  const isArrayLike = data.nodes && data.nodes.length > 0 &&
    data.nodes.some((n) => 'arrayIndex' in n) &&
    !data.nodes.some((n) => 'left' in n || 'right' in n)

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {data.buckets ? renderBucketView()
        : data.slots ? renderSlotView()
        : isArrayLike ? renderArrayLikeView()
        : isChain ? renderChainBoxView()
        : renderNodeEdgeView()}
    </div>
  )
}
