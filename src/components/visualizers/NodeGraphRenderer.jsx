import { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Stage, Layer, Circle, Line, Text, Rect, Arrow } from 'react-konva'

// Measures the wrapping element and reports its content-box size,
// updating on resize so the Stage can be scaled to fit instead of
// overflowing and getting auto-centered/scroll-clipped by the parent.
function useContainerSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 640, height: 340 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}

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

  // Wraps a Stage's content in a scaled+centered Layer so diagrams shrink to
  // fit the actual panel width instead of overflowing and getting silently
  // scrolled (which is what was clipping the leftmost/head node before).
  function ScaledStage({ naturalWidth, naturalHeight, children }) {
    const scale = Math.min(
      containerSize.width / naturalWidth,
      containerSize.height / naturalHeight,
      1 // never upscale past 1:1
    ) || 1
    const offsetX = (containerSize.width - naturalWidth * scale) / 2
    const offsetY = (containerSize.height - naturalHeight * scale) / 2
    return (
      <Stage width={containerSize.width} height={containerSize.height}>
        <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          {children}
        </Layer>
      </Stage>
    )
  }

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
      data.nodes.forEach((n) => {
        pos[n.id] = { x: 60 + n.arrayIndex * 80, y: 150 }
      })
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
          return (
            <g key={bucket.bucketIndex}>
              <Rect x={bp.x - 40} y={bp.y - 16} width={80} height={32} fill={nullColor} opacity={0.25} cornerRadius={4} />
              <Text x={bp.x - 40} y={bp.y - 8} width={80} align="center" text={`[${bucket.bucketIndex}]`} fontSize={12} fill={nodeInk === '#FFFFFF' ? '#333' : nodeInk} />
              {(bucket.chain || []).map((cn, ci) => {
                const np = positions[cn.id]
                const prevX = ci === 0 ? bp.x + 40 : positions[bucket.chain[ci - 1].id].x + 30
                return (
                  <g key={cn.id}>
                    <Line points={[prevX, np.y, np.x - 30, np.y]} stroke={pointerColor} strokeWidth={2} />
                    <Circle x={np.x} y={np.y} radius={NODE_R} fill={cn.broken ? brokenColor : nodeColor} />
                    <Text x={np.x - 25} y={np.y - 8} width={50} align="center" text={String(cn.key ?? cn.value)} fontSize={13} fill={nodeInk} />
                  </g>
                )
              })}
            </g>
          )
        })}
    </ScaledStage>
  )

  const renderSlotView = () => (
    <ScaledStage naturalWidth={Math.max(width, 60 + data.slots.length * 80)} naturalHeight={220}>
        {data.slots.map((slot) => {
          const sp = positions[`slot${slot.slotIndex}`]
          const empty = slot.value === null || slot.value === undefined
          return (
            <g key={slot.slotIndex}>
              <Rect x={sp.x - 30} y={sp.y - 30} width={60} height={60}
                fill={empty ? 'transparent' : (slot.broken ? brokenColor : nodeColor)}
                stroke={nullColor} strokeWidth={1.5} cornerRadius={6} />
              <Text x={sp.x - 30} y={sp.y - 46} width={60} align="center" text={`[${slot.slotIndex}]`} fontSize={11} fill={inkMuted} />
              {!empty && (
                <Text x={sp.x - 30} y={sp.y - 8} width={60} align="center" text={String(slot.value)} fontSize={14} fill={nodeInk} />
              )}
            </g>
          )
        })}
    </ScaledStage>
  )

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
              <g key={i}>
                <Line points={[from.x + NODE_R, from.y, from.x + NODE_R + 40, from.y]} stroke={stroke} strokeWidth={2} dash={[4, 4]} />
                <Text x={from.x + NODE_R + 10} y={from.y - 20} text="NULL" fontSize={12} fill={nullColor} fontStyle="bold" />
              </g>
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
            <g key={node.id} onMouseEnter={() => onNodeHover && onNodeHover(node.id)} onMouseLeave={() => onNodeHover && onNodeHover(null)}>
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
            </g>
          )
        })}
    </ScaledStage>
  )

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {data.buckets ? renderBucketView() : data.slots ? renderSlotView() : renderNodeEdgeView()}
    </div>
  )
}
