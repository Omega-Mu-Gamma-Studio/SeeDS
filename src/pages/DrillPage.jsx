import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { drillService } from '../services/drillService.js'
import { useDrillStore } from '../store/drillStore.js'
import DrillProgress from '../components/drill/DrillProgress.jsx'
import QuickfireCard from '../components/drill/QuickfireCard.jsx'
import RoutineWriter from '../components/drill/RoutineWriter.jsx'
import FullTrace from '../components/drill/FullTrace.jsx'
import BossRound from '../components/drill/BossRound.jsx'
import './DrillPage.css'

const TRACKS = ['quickfire', 'routineWriter', 'fullTrace']
const TRACK_LABELS = { quickfire: '⚡ Quickfire', routineWriter: '✍ Routine Writer', fullTrace: '🔍 Full Trace' }

export default function DrillPage() {
  const { drillId } = useParams()
  const navigate = useNavigate()
  const drill = drillService.getDrill(drillId)
  const recordAttempt = useDrillStore((s) => s.recordAttempt)
  const isBossUnlocked = useDrillStore((s) => s.isBossRoundUnlocked(drillId))

  const [activeOpId, setActiveOpId] = useState(drill?.operations[0]?.id ?? null)
  const [activeTrack, setActiveTrack] = useState('quickfire')
  const [sessionKey, setSessionKey] = useState(0) // bump to reset active card
  const [bossMode, setBossMode] = useState(false)

  if (!drill) {
    return (
      <div className="drill-page">
        <p>Drill not found.</p>
        <button type="button" onClick={() => navigate('/drill')}>← Back</button>
      </div>
    )
  }

  const activeOp = drill.operations.find((op) => op.id === activeOpId)
  const availableTracks = activeOp
    ? TRACKS.filter((t) => activeOp.tracks?.[t])
    : []

  function handleAttemptComplete({ correct, clean, timeMs }) {
    if (!activeOpId) return
    recordAttempt(drillId, activeOpId, {
      clean: clean ?? correct,
      timeMs: timeMs ?? 0,
      allOperationIds: drillService.getOperationIds(drillId),
    })
    // Advance session key to remount the card for another rep
    setTimeout(() => setSessionKey((k) => k + 1), 1800)
  }

  if (bossMode) {
    return (
      <div className="drill-page">
        <div className="drill-page__header">
          <button type="button" className="drill-page__back" onClick={() => setBossMode(false)}>
            ← Back to drill
          </button>
          <h1>{drill.title} — Boss Round</h1>
        </div>
        <BossRound drill={drill} />
      </div>
    )
  }

  return (
    <div className="drill-page">
      <div className="drill-page__header">
        <button type="button" className="drill-page__back" onClick={() => navigate('/drill')}>
          ← Lock-In Mode
        </button>
        <h1>{drill.title}</h1>
      </div>

      <div className="drill-page__layout">
        {/* Left: operation picker + progress */}
        <aside className="drill-page__sidebar">
          <h3 className="drill-page__sidebar-title">Operations</h3>
          <DrillProgress
            drill={drill}
            activeOperationId={activeOpId}
            onSelectOperation={(opId) => {
              setActiveOpId(opId)
              setSessionKey((k) => k + 1)
              // Default to first available track for the new operation
              const op = drill.operations.find((o) => o.id === opId)
              const firstTrack = TRACKS.find((t) => op?.tracks?.[t])
              if (firstTrack) setActiveTrack(firstTrack)
            }}
          />

          {isBossUnlocked && (
            <button
              type="button"
              className="drill-page__boss-btn"
              onClick={() => setBossMode(true)}
            >
              👊 Boss Round
            </button>
          )}
        </aside>

        {/* Right: track picker + active card */}
        <main className="drill-page__main">
          {activeOp && (
            <>
              <div className="drill-page__track-tabs">
                {availableTracks.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`drill-page__tab ${activeTrack === t ? 'drill-page__tab--active' : ''}`}
                    onClick={() => {
                      setActiveTrack(t)
                      setSessionKey((k) => k + 1)
                    }}
                  >
                    {TRACK_LABELS[t]}
                  </button>
                ))}
              </div>

              <div key={`${activeOpId}-${activeTrack}-${sessionKey}`}>
                {activeTrack === 'quickfire' && activeOp.tracks?.quickfire && (
                  <QuickfireCard
                    track={activeOp.tracks.quickfire}
                    onComplete={handleAttemptComplete}
                  />
                )}
                {activeTrack === 'routineWriter' && activeOp.tracks?.routineWriter && (
                  <RoutineWriter
                    track={activeOp.tracks.routineWriter}
                    onComplete={handleAttemptComplete}
                  />
                )}
                {activeTrack === 'fullTrace' && activeOp.tracks?.fullTrace && (
                  <FullTrace
                    track={activeOp.tracks.fullTrace}
                    onComplete={handleAttemptComplete}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
