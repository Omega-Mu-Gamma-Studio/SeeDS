import { Group, Rect, Text } from 'react-konva'
import { useContainerSize, ScaledStage } from './useScaledStage.jsx'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

/**
 * Radix sort's digit-bucket distribution view.
 * data: { digitPosition: string, buckets: { [digit]: number[] }, values: number[] }
 * mappingHighlight, when set to "bucket<d>" by a hovered code line, outlines
 * that digit's bucket.
 */
export default function BucketsRenderer({ data, mappingHighlight }) {
  const nodeColor = resolveVar('--ds-node')
  const inkMuted = resolveVar('--ink-muted')
  const highlightColor = resolveVar('--ds-highlight')
  const [containerRef, containerSize] = useContainerSize({ width: 640, height: 220 })

  if (!data) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const digits = Array.from({ length: 10 }, (_, i) => String(i))
  const width = 640
  const cellW = width / 10
  const maxChain = Math.max(0, ...digits.map((d) => (data.buckets?.[d] || []).length))
  const height = Math.max(220, 40 + maxChain * 34 + 20)

  return (
    <div className="buckets-renderer">
      <p className="buckets-renderer__label">Distributing by {data.digitPosition} digit</p>
      <div ref={containerRef} style={{ width: '100%', height: 220 }}>
        <ScaledStage containerSize={containerSize} naturalWidth={width} naturalHeight={height}>
          {digits.map((d, i) => {
            const items = data.buckets?.[d] || []
            const x = i * cellW
            const active = mappingHighlight === `bucket${d}`
            return (
              <Group key={d}>
                <Rect x={x + 4} y={20} width={cellW - 8} height={height - 40}
                  stroke={active ? highlightColor : inkMuted}
                  strokeWidth={active ? 3 : 1} cornerRadius={6} />
                <Text x={x} y={4} width={cellW} align="center" text={d} fontSize={12} fill={inkMuted} />
                {items.map((val, vi) => (
                  <Group key={vi}>
                    <Rect x={x + 8} y={30 + vi * 34} width={cellW - 16} height={28} fill={nodeColor} cornerRadius={4} />
                    <Text x={x + 8} y={38 + vi * 34} width={cellW - 16} align="center" text={String(val)} fontSize={12} fill="#FFFFFF" />
                  </Group>
                ))}
              </Group>
            )
          })}
        </ScaledStage>
      </div>
    </div>
  )
}
