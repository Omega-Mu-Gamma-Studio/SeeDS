import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrillStore } from '../../store/drillStore.js'
import QuickfireCard from './QuickfireCard.jsx'
import RoutineWriter from './RoutineWriter.jsx'
import './DrillComponents.css'

/**
 * Boss Round: reproduce every operation's quickfire + routineWriter back-to-back,
 * timed globally. Unlocked only when all ops are individually locked in.
 * This is the exam-simulation finale — no hints, no reveals mid-run.
 */
export default function BossRound({ drill }) {
  const completeBossRound = useDrillStore((s) => s.completeBossRound)
  const isBossComplete = useDrillStore((s) => s.isBossRoundComplete(drill.id))

  // Flatten all quickfire + routineWriter tracks into a linear sequence
  const tasks = drill.operations.flatMap((op) => {
    const out = []
    if (op.tracks?.quickfire) out.push({ opId: op.id, opName: op.displayName, type: 'quickfire', track: op.tracks.quickfire })
    if (op.tracks?.routineWriter) out.push({ opId: op.id, opName: op.displayName, type: 'routine', track: op.tracks.routineWriter })
    return out
  })

  const [taskIndex, setTaskIndex] = useState(0)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(isBossComplete)
  const [totalTime, setTotalTime] = useState(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
  }, [])

  if (tasks.length === 0) return null

  function handleTaskComplete(result) {
    const next = [...results, { ...result, task: tasks[taskIndex] }]
    setResults(next)
    if (taskIndex < tasks.length - 1) {
      setTaskIndex(taskIndex + 1)
    } else {
      const ms = Date.now() - startRef.current
      setTotalTime(ms)
      setDone(true)
      completeBossRound(drill.id)
    }
  }

  const current = tasks[taskIndex]
  const passedCount = results.filter((r) => r.correct).length

  if (isBossComplete && done) {
    return (
      <div className="drill-card drill-card--boss">
        <div className="drill-card__boss-complete">
          <h3>🏆 Boss Round Complete</h3>
          <p>You've fully drilled <strong>{drill.title}</strong>. Go dominate that exam.</p>
        </div>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((passedCount / tasks.length) * 100)
    return (
      <motion.div
        className="drill-card drill-card--boss"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3>Boss Round — Result</h3>
        <p>{passedCount}/{tasks.length} tasks correct ({pct}%)</p>
        <p>Total time: {(totalTime / 1000).toFixed(1)}s</p>
        {pct === 100
          ? <p className="drill-card__feedback drill-card__feedback--correct">🔥 Perfect run. You're locked in.</p>
          : <p className="drill-card__feedback drill-card__feedback--wrong">Review the missed routines in the lesson, then retry.</p>
        }
      </motion.div>
    )
  }

  return (
    <div className="drill-card drill-card--boss">
      <div className="drill-card__header">
        <span className="drill-card__track-label">👊 Boss Round</span>
        <span className="drill-card__timer">
          {taskIndex + 1}/{tasks.length}
        </span>
      </div>

      <p className="drill-card__boss-subtitle">
        <strong>{current.opName}</strong> — {current.type === 'quickfire' ? 'Quickfire' : 'Routine Writer'}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={taskIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {current.type === 'quickfire' && (
            <QuickfireCard track={current.track} onComplete={handleTaskComplete} />
          )}
          {current.type === 'routine' && (
            <RoutineWriter track={current.track} onComplete={handleTaskComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
