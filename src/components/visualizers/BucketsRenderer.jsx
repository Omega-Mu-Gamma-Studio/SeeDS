import { Stage, Layer, Rect, Text } from 'react-konva'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

/**
 * Radix sort's digit-bucket distribution view.
 * data: { digitPosition: string, buckets: { [digit]: number[] }, values: number[] }
 */
export default function BucketsRenderer({ data }) {
  const nodeColor = resolveVar('--ds-node')
  const inkMuted = resolveVar('--ink-muted')

  if (!data) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const digits = Array.from({ length: 10 }, (_, i) => String(i))
  const width = 640
  const cellW = width / 10
  const height = 220

  return (
    <div className="buckets-renderer">
      <p className="buckets-renderer__label">Distributing by {data.digitPosition} digit</p>
      <Stage width={width} height={height}>
        <Layer>
          {digits.map((d, i) => {
            const items = data.buckets?.[d] || []
            const x = i * cellW
            return (
              <g key={d}>
                <Rect x={x + 4} y={20} width={cellW - 8} height={height - 40} stroke={inkMuted} strokeWidth={1} cornerRadius={6} />
                <Text x={x} y={4} width={cellW} align="center" text={d} fontSize={12} fill={inkMuted} />
                {items.map((val, vi) => (
                  <g key={vi}>
                    <Rect x={x + 8} y={30 + vi * 34} width={cellW - 16} height={28} fill={nodeColor} cornerRadius={4} />
                    <Text x={x + 8} y={38 + vi * 34} width={cellW - 16} align="center" text={String(val)} fontSize={12} fill="#FFFFFF" />
                  </g>
                ))}
              </g>
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
