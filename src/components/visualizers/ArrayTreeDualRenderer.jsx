import { useMemo, useState } from 'react'
import { Group, Circle, Rect, Text, Line } from 'react-konva'
import { useContainerSize, ScaledStage } from './useScaledStage.jsx'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

/**
 * Heaps get a simultaneous array-index view and tree view, kept in sync
 * (PRD §11.2 "Dual View"). Hovering either representation highlights the
 * same node in both.
 */
export default function ArrayTreeDualRenderer({ data, mappingHighlight }) {
  const [hovered, setHovered] = useState(null)
  const [arrayContainerRef, arrayContainerSize] = useContainerSize({ width: 320, height: 90 })
  const [treeContainerRef, treeContainerSize] = useContainerSize({ width: 620, height: 220 })
  const nodeColor = resolveVar('--ds-node')
  const brokenColor = resolveVar('--ds-broken')
  const highlightColor = resolveVar('--ds-highlight')
  const ink = '#FFFFFF'
  const inkMuted = resolveVar('--ink-muted')

  const nodes = useMemo(() => data?.nodes || [], [data])

  const treePositions = useMemo(() => {
    const pos = {}
    const byIndex = Object.fromEntries(nodes.map((n) => [n.arrayIndex, n]))
    function place(idx, depth, xMin, xMax) {
      const node = byIndex[idx]
      if (!node) return
      const x = (xMin + xMax) / 2
      pos[node.id] = { x, y: 30 + depth * 60 }
      place(2 * idx + 1, depth + 1, xMin, x)
      place(2 * idx + 2, depth + 1, x, xMax)
    }
    place(0, 0, 20, 600)
    return pos
  }, [nodes])

  if (!nodes.length) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const cellW = 56

  return (
    <div className="array-tree-dual">
      <div className="array-tree-dual__section">
        <p className="array-tree-dual__label">Array view</p>
        <div ref={arrayContainerRef} style={{ width: '100%', height: 90 }}>
          <ScaledStage containerSize={arrayContainerSize} naturalWidth={Math.max(320, nodes.length * (cellW + 8))} naturalHeight={90}>
            {nodes.map((n) => {
              const x = n.arrayIndex * (cellW + 8) + 8
              const active = hovered === n.id || mappingHighlight === n.id
              return (
                <Group key={n.id}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}>
                  <Rect x={x} y={20} width={cellW} height={44}
                    fill={n.broken ? brokenColor : nodeColor}
                    stroke={active ? highlightColor : undefined}
                    strokeWidth={active ? 4 : 0}
                    cornerRadius={6} />
                  <Text x={x} y={34} width={cellW} align="center" text={String(n.value)} fontSize={14} fill={ink} />
                  <Text x={x} y={68} width={cellW} align="center" text={`[${n.arrayIndex}]`} fontSize={10} fill={inkMuted} />
                </Group>
              )
            })}
          </ScaledStage>
        </div>
      </div>
      <div className="array-tree-dual__section">
        <p className="array-tree-dual__label">Tree view</p>
        <div ref={treeContainerRef} style={{ width: '100%', height: 220 }}>
          <ScaledStage containerSize={treeContainerSize} naturalWidth={620} naturalHeight={220}>
            {nodes.map((n) => {
              if (n.parentIndex === null || n.parentIndex === undefined) return null
              const parent = nodes.find((p) => p.arrayIndex === n.parentIndex)
              if (!parent) return null
              const from = treePositions[parent.id]
              const to = treePositions[n.id]
              if (!from || !to) return null
              const violation = n.broken
              return (
                <Line key={`e${n.id}`} points={[from.x, from.y, to.x, to.y]}
                  stroke={violation ? brokenColor : inkMuted} strokeWidth={2} />
              )
            })}
            {nodes.map((n) => {
              const p = treePositions[n.id]
              const active = hovered === n.id || mappingHighlight === n.id
              return (
                <Group key={n.id}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}>
                  <Circle x={p.x} y={p.y} radius={24}
                    fill={n.broken ? brokenColor : nodeColor}
                    stroke={active ? highlightColor : undefined}
                    strokeWidth={active ? 4 : 0} />
                  <Text x={p.x - 20} y={p.y - 8} width={40} align="center" text={String(n.value)} fontSize={13} fill={ink} />
                </Group>
              )
            })}
          </ScaledStage>
        </div>
      </div>
    </div>
  )
}
