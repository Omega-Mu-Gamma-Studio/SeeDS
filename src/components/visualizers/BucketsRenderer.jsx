import { Group, Rect, Text } from 'react-konva'
import { useContainerSize, ScaledStage } from './useScaledStage.jsx'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

/**
 * Radix sort's digit-bucket distribution view. Stacks one row of 10 buckets
 * per recorded digit-position pass, so the whole distribution history is
 * visible at once instead of only ever showing a single pass.
 * data: { values: number[], passes: [{ digitPosition: string, buckets: { [digit]: number[] } }] }
 * mappingHighlight, when set to "p<N>-bucket<d>" (1-indexed pass) by a
 * hovered code line, outlines that pass's digit bucket.
 */
export default function BucketsRenderer({ data, mappingHighlight }) {
  const nodeColor = resolveVar('--ds-node')
  const inkMuted = resolveVar('--ink-muted')
  const highlightColor = resolveVar('--ds-highlight')
  const [containerRef, containerSize] = useContainerSize({ width: 640, height: 220 })

  if (!data?.passes?.length) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const digits = Array.from({ length: 10 }, (_, i) => String(i))
  const width = 640
  const cellW = width / 10
  const labelH = 24
  const passGap = 16

  const blocks = data.passes.map((pass) => {
    const maxChain = Math.max(0, ...digits.map((d) => (pass.buckets?.[d] || []).length))
    return { pass, height: Math.max(90, 40 + maxChain * 34 + 20) }
  })

  const offsets = blocks.reduce((acc, { height }) => {
    const prevEnd = acc.length ? acc[acc.length - 1].end : 0
    acc.push({ start: prevEnd, end: prevEnd + labelH + height + passGap })
    return acc
  }, []).map((o) => o.start)
  const naturalHeight = Math.max(220, offsets.length
    ? offsets[offsets.length - 1] + labelH + blocks[blocks.length - 1].height
    : 220)

  return (
    <div className="buckets-renderer">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <ScaledStage containerSize={containerSize} naturalWidth={width} naturalHeight={naturalHeight}>
          {blocks.map(({ pass, height }, pi) => {
            const top = offsets[pi]
            const rowTop = top + labelH
            return (
              <Group key={pi}>
                <Text x={0} y={top} width={width} align="center"
                  text={`Distributing by ${pass.digitPosition} digit`} fontSize={13} fill={inkMuted} />
                {digits.map((d, i) => {
                  const items = pass.buckets?.[d] || []
                  const x = i * cellW
                  const active = mappingHighlight === `p${pi + 1}-bucket${d}`
                  return (
                    <Group key={d}>
                      <Rect x={x + 4} y={rowTop} width={cellW - 8} height={height - 20}
                        stroke={active ? highlightColor : inkMuted}
                        strokeWidth={active ? 3 : 1} cornerRadius={6} />
                      <Text x={x} y={rowTop - 15} width={cellW} align="center" text={d} fontSize={11} fill={inkMuted} />
                      {items.map((val, vi) => (
                        <Group key={vi}>
                          <Rect x={x + 8} y={rowTop + 10 + vi * 34} width={cellW - 16} height={28} fill={nodeColor} cornerRadius={4} />
                          <Text x={x + 8} y={rowTop + 18 + vi * 34} width={cellW - 16} align="center" text={String(val)} fontSize={12} fill="#FFFFFF" />
                        </Group>
                      ))}
                    </Group>
                  )
                })}
              </Group>
            )
          })}
        </ScaledStage>
      </div>
    </div>
  )
}
