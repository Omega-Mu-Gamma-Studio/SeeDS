import { useNavigate } from 'react-router-dom'
import { drillService } from '../services/drillService.js'
import { useDrillStore } from '../store/drillStore.js'
import './DrillHub.css'

export default function DrillHub() {
  const navigate = useNavigate()
  const getDrillStats = useDrillStore((s) => s.getDrillStats)
  const isBossRoundUnlocked = useDrillStore((s) => s.isBossRoundUnlocked)
  const isBossRoundComplete = useDrillStore((s) => s.isBossRoundComplete)

  const units = drillService.getAvailableUnits()

  return (
    <div className="drill-hub">
      <div className="drill-hub__header">
        <button type="button" className="drill-hub__back" onClick={() => navigate('/campus/cs')}>
          ← CS Block
        </button>
        <h1>Lock-In Mode</h1>
        <p className="drill-hub__tagline">
          Exam-drill layer. Reproduce routines cold, under time pressure,
          with the edge cases graders actually dock marks for.
        </p>
      </div>

      {units.map((unitNum) => {
        const drills = drillService.getDrillsForUnit(unitNum)
        return (
          <section key={unitNum} className="drill-hub__unit">
            <h2 className="drill-hub__unit-title">Unit {unitNum}</h2>
            <ul className="drill-hub__drill-list">
              {drills.map((drill) => {
                const stats = getDrillStats(drill.id)
                const totalOps = drill.operations.length
                const lockedIn = drill.operations.filter((op) => stats[op.id]?.lockedIn).length
                const bossUnlocked = isBossRoundUnlocked(drill.id)
                const bossComplete = isBossRoundComplete(drill.id)

                return (
                  <li key={drill.id}>
                    <button
                      type="button"
                      className={[
                        'drill-hub__drill-row',
                        bossComplete ? 'drill-hub__drill-row--complete' : '',
                        bossUnlocked && !bossComplete ? 'drill-hub__drill-row--boss-ready' : '',
                      ].join(' ').trim()}
                      onClick={() => navigate(`/drill/${drill.id}`)}
                    >
                      <span className="drill-hub__drill-name">{drill.title}</span>
                      <span className="drill-hub__drill-meta">
                        {bossComplete
                          ? '🔒 Locked in'
                          : bossUnlocked
                          ? '👊 Boss Round ready'
                          : `${lockedIn}/${totalOps} ops locked`}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      {units.length === 0 && (
        <p className="drill-hub__empty">No drills available yet.</p>
      )}
    </div>
  )
}
