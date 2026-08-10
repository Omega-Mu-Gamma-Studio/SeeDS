import { useDrillStore } from '../../store/drillStore.js'
import './DrillComponents.css'

const LOCKIN_THRESHOLD = 3

/**
 * Shows a row of operation cards with lock-in state for a given drill.
 */
export default function DrillProgress({ drill, onSelectOperation, activeOperationId }) {
  const getDrillStats = useDrillStore((s) => s.getDrillStats)
  const stats = getDrillStats(drill.id)

  return (
    <div className="drill-progress">
      {drill.operations.map((op) => {
        const s = stats[op.id] || { cleanCount: 0, lockedIn: false }
        const pips = Math.min(s.cleanCount, LOCKIN_THRESHOLD)
        const isActive = op.id === activeOperationId

        return (
          <button
            key={op.id}
            type="button"
            className={[
              'drill-progress__op',
              s.lockedIn ? 'drill-progress__op--locked-in' : '',
              isActive ? 'drill-progress__op--active' : '',
            ].join(' ').trim()}
            onClick={() => onSelectOperation?.(op.id)}
          >
            <span className="drill-progress__op-name">{op.displayName}</span>
            <span className="drill-progress__pips">
              {Array.from({ length: LOCKIN_THRESHOLD }).map((_, i) => (
                <span
                  key={i}
                  className={`drill-progress__pip ${i < pips ? 'drill-progress__pip--filled' : ''}`}
                />
              ))}
            </span>
            {s.lockedIn && <span className="drill-progress__lock">🔒</span>}
            {s.bestTimeMs && (
              <span className="drill-progress__best">
                Best: {(s.bestTimeMs / 1000).toFixed(1)}s
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
