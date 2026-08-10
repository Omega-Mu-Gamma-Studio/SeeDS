import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './DrillComponents.css'

/**
 * Full Trace track: 16-mark multi-step operation sequence.
 * Shows one step at a time. Student attempts to describe/draw the state,
 * then reveals the expected state/note. Self-assessed.
 */
export default function FullTrace({ track, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [revealed, setRevealed] = useState([])
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  const timerRef = useRef(null)

  useEffect(() => {
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  if (!track) return null

  const steps = track.steps || []
  const timeLimit = track.timeLimitSeconds ?? 420
  const remaining = Math.max(0, timeLimit - elapsed)
  const urgent = remaining <= 30 && !done
  const current = steps[stepIndex]

  function revealCurrent() {
    setRevealed((prev) => prev.includes(stepIndex) ? prev : [...prev, stepIndex])
  }

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      clearInterval(timerRef.current)
      setDone(true)
      const timeMs = Date.now() - startRef.current
      // Full trace is always self-assessed — report clean if finished within time
      onComplete?.({ correct: true, clean: timeMs <= timeLimit * 1000, timeMs })
    }
  }

  return (
    <motion.div
      className="drill-card drill-card--trace"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="drill-card__header">
        <span className="drill-card__track-label">🔍 Full Trace</span>
        <span className={`drill-card__timer${urgent ? ' drill-card__timer--urgent' : ''}`}>
          {done ? '✓ Done' : `${remaining}s`}
        </span>
      </div>

      <p className="drill-card__question">{track.questionText}</p>

      <div className="drill-card__step-progress">
        Step {stepIndex + 1} / {steps.length}
        <div className="drill-card__step-bar">
          <div
            className="drill-card__step-fill"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {!done && current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            className="drill-card__step"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="drill-card__step-op">
              <code>{current.operation}</code>
            </div>

            <p className="drill-card__step-prompt">
              What is the state of the structure after this operation?
              <br />
              <span className="drill-card__step-hint">Think it through, then reveal to check.</span>
            </p>

            {!revealed.includes(stepIndex) ? (
              <button
                type="button"
                className="drill-card__reveal-btn"
                onClick={revealCurrent}
              >
                Reveal expected state
              </button>
            ) : (
              <motion.div
                className="drill-card__step-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="drill-card__step-note">{current.note}</p>
                {current.expectedVisual && (
                  <div className="drill-card__step-visual-note">
                    <em>Visual: {current.expectedVisual.rendererType} — see lesson Phase 3 for renderer reference.</em>
                  </div>
                )}
                <button
                  type="button"
                  className="drill-card__next-btn"
                  onClick={handleNext}
                >
                  {stepIndex < steps.length - 1 ? 'Next step →' : 'Finish trace'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {done && (
        <motion.div
          className="drill-card__done"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>✓ Trace complete. Review any steps you weren't sure about against the lesson visual.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
