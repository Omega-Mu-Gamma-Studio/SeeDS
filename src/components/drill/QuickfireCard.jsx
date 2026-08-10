import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './DrillComponents.css'

/**
 * Quickfire track: 2-mark rapid recall.
 * Supports type: 'multiple-choice' | 'fill'.
 * Reports { correct, timeMs } to onComplete.
 */
export default function QuickfireCard({ track, onComplete }) {
  const [selected, setSelected] = useState(null)      // for MCQ
  const [fillValue, setFillValue] = useState('')       // for fill
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(null)
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

  const timeLimit = track.timeLimitSeconds ?? 30
  const timeUp = elapsed >= timeLimit && !submitted

  function normalize(s) {
    return String(s).trim().toLowerCase()
  }

  function submit(answer) {
    if (submitted) return
    clearInterval(timerRef.current)
    const timeMs = Date.now() - startRef.current
    const isCorrect = normalize(answer) === normalize(track.answer)
    setSubmitted(true)
    setCorrect(isCorrect)
    // Slight delay so the student sees the feedback before the card advances
    setTimeout(() => onComplete?.({ correct: isCorrect, timeMs }), 1200)
  }

  function handleFillSubmit() {
    submit(fillValue)
  }

  const remaining = Math.max(0, timeLimit - elapsed)
  const urgent = remaining <= 10 && !submitted

  return (
    <motion.div
      className="drill-card drill-card--quickfire"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="drill-card__header">
        <span className="drill-card__track-label">⚡ Quickfire</span>
        <span className={`drill-card__timer${urgent ? ' drill-card__timer--urgent' : ''}`}>
          {submitted ? '—' : `${remaining}s`}
        </span>
      </div>

      <p className="drill-card__question">{track.question}</p>

      {track.type === 'multiple-choice' && (
        <ul className="drill-card__options">
          {track.options.map((opt) => {
            let cls = 'drill-card__option'
            if (submitted) {
              if (normalize(opt) === normalize(track.answer)) cls += ' drill-card__option--correct'
              else if (opt === selected) cls += ' drill-card__option--wrong'
            } else if (opt === selected) {
              cls += ' drill-card__option--selected'
            }
            return (
              <li key={opt}>
                <button
                  type="button"
                  className={cls}
                  disabled={submitted || timeUp}
                  onClick={() => {
                    setSelected(opt)
                    submit(opt)
                  }}
                >
                  {opt}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {track.type === 'fill' && (
        <div className="drill-card__fill-row">
          <input
            type="text"
            className="drill-card__fill-input"
            value={fillValue}
            disabled={submitted || timeUp}
            onChange={(e) => setFillValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFillSubmit()}
            placeholder="Your answer…"
            autoFocus
          />
          <button
            type="button"
            className="drill-card__submit-btn"
            disabled={submitted || timeUp || !fillValue.trim()}
            onClick={handleFillSubmit}
          >
            Submit
          </button>
        </div>
      )}

      {timeUp && !submitted && (
        <p className="drill-card__feedback drill-card__feedback--timeout">
          Time's up. Answer: <strong>{track.answer}</strong>
        </p>
      )}

      {submitted && correct && (
        <p className="drill-card__feedback drill-card__feedback--correct">✓ Correct</p>
      )}
      {submitted && correct === false && !timeUp && (
        <p className="drill-card__feedback drill-card__feedback--wrong">
          ✗ Answer: <strong>{track.answer}</strong>
        </p>
      )}
    </motion.div>
  )
}
