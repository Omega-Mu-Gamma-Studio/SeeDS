/**
 * Sorting visualizer, box-grid style: one row of numbered boxes per pass,
 * stacked top to bottom, so the whole trace is visible at once instead of
 * scrubbing through a single bar chart one comparison at a time.
 * data: { values: number[], passes: [{ label: string, values: number[] }] }
 * mappingHighlight, when set by a hovered code line, is either "start"
 * (highlight the initial row) or "pass<N>" (1-indexed) to highlight that
 * pass's row and the boxes that changed within it.
 */
export default function GridRenderer({ data, mappingHighlight }) {
  const { values = [], passes = [] } = data || {}
  if (!values.length) return <div style={{ padding: '1rem', color: 'var(--ink-muted)' }}>No visual data.</div>

  const rows = [{ label: 'Start', values, changed: [] }, ...passes.map((p, i) => {
    const prev = i === 0 ? values : passes[i - 1].values
    const changed = p.values.map((v, idx) => v !== prev[idx] ? idx : -1).filter((idx) => idx !== -1)
    return { label: p.label || `Pass ${i + 1}`, values: p.values, changed }
  })]

  return (
    <div className="grid-renderer">
      {rows.map((row, i) => {
        const rowId = i === 0 ? 'start' : `pass${i}`
        const rowActive = mappingHighlight === rowId
        return (
          <div key={rowId} className={`grid-renderer__row${rowActive ? ' grid-renderer__row--active' : ''}`}>
            <span className="grid-renderer__row-label">{row.label}</span>
            <div className="grid-renderer__boxes">
              {row.values.map((v, idx) => (
                <div key={idx} className={`grid-renderer__box${row.changed.includes(idx) ? ' grid-renderer__box--changed' : ''}`}>
                  {v}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
