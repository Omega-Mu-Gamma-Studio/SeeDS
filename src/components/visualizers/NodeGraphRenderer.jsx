import { useMemo } from 'react'
import { Group, Circle, Line, Text, Rect, Arrow } from 'react-konva'
import { useContainerSize, ScaledStage as SharedScaledStage } from './useScaledStage.jsx'

const NODE_R = 26

// Resolve CSS custom properties to actual color values Konva can use,
// since Konva can't read var(--x) directly.
function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  const val = getComputedStyle(document.documentElement).getPropertyValue(name)
  return val?.trim() || '#4A90D9'
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

    // linear chain (linked list)
    data.nodes.forEach((n, i) => {
      pos[n.id] = { x: 60 + i * 110, y: 150 }
    })
    return pos
  }, [data, width, height])

  if (!data) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

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
      {data.buckets ? renderBucketView() : data.slots ? renderSlotView() : isArrayLike ? renderArrayLikeView() : renderNodeEdgeView()}
    </div>
  )
}
