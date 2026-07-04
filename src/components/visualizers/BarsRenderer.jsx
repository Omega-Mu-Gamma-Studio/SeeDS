import { useState, useMemo } from 'react'
import { Stage, Layer, Rect, Text } from 'react-konva'

function resolveVar(name) {
  if (typeof window === 'undefined') return '#4A90D9'
  return getComputedStyle(document.documentElement).getPropertyValue(name)?.trim() || '#4A90D9'
}

/**
 * Sorting visualizer for comparison-based sorts (bubble/quick/merge/shell).
 * data: { values: number[], comparisons: [i,j][], swaps: [i,j][] }
 * Step controls (P1, PRD §11.1) let the student scrub through the recorded
 * comparisons/swaps log one step at a time.
 */
export default function BarsRenderer({ data }) {
  const [step, setStep] = useState(0)
  const nodeColor = resolveVar('--ds-node')
  const highlightColor = resolveVar('--ds-highlight')
  const ink = resolveVar('--ink')

  const { values = [], comparisons = [], swaps = [] } = data || {}
  const totalSteps = comparisons.length

  const currentValues = useMemo(() => {
    // Apply swaps up to current step to visualize progressive sorting
    const arr = [...values]
    for (let s = 0; s < step; s++) {
      const swap = swaps[s]
      if (swap) {
        const [i, j] = swap
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
    return arr
  }, [values, swaps, step])

  if (!values.length) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const width = Math.max(320, values.length * 70)
  const height = 260
  const maxVal = Math.max(...values, 1)
  const barWidth = Math.min(56, (width - 40) / values.length - 12)

  const activeIndices = comparisons[step] || []

  return (
    <div className="bars-renderer">
      <Stage width={width} height={height}>
        <Layer>
          {currentValues.map((val, i) => {
            const barHeight = (val / maxVal) * (height - 60)
            const x = 20 + i * (barWidth + 12)
            const y = height - 30 - barHeight
            const active = activeIndices.includes(i)
            return (
              <g key={i}>
                <Rect x={x} y={y} width={barWidth} height={barHeight}
                  fill={active ? highlightColor : nodeColor}
                  cornerRadius={4} />
                <Text x={x} y={height - 22} width={barWidth} align="center" text={String(val)} fontSize={13} fill={ink} />
              </g>
            )
          })}
        </Layer>
      </Stage>
      {totalSteps > 0 && (
        <div className="bars-renderer__controls">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>◀ Prev</button>
          <span>Step {step} / {totalSteps}</span>
          <button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))} disabled={step === totalSteps}>Next ▶</button>
        </div>
      )}
    </div>
  )
}
