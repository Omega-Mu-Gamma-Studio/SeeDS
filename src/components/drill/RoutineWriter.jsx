import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './DrillComponents.css'

/**
 * Routine Writer track: write a C function from near-blank.
 * Feedback is checklist-based: did you include these key lines?
 * This mirrors the exam grader model (missing a specific line costs marks).
 */
export default function RoutineWriter({ track, onComplete }) {
  const [code, setCode] = useState(track?.scaffoldCode ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null) // [{ line, description, included }]
  const [revealed, setRevealed] = useState(false)
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

  const timeLimit = track.timeLimitSeconds ?? 180
  const remaining = Math.max(0, timeLimit - elapsed)
  const urgent = remaining <= 20 && !submitted

  function handleSubmit() {
    clearInterval(timerRef.current)
    const timeMs = Date.now() - startRef.current
    const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ')

    const checked = (track.commonMistakes || []).map((item) => ({
      ...item,
      included: normalizedCode.includes(item.line.toLowerCase().replace(/\s+/g, ' ')),
    }))

    setResults(checked)
    setSubmitted(true)

    const allIncluded = checked.every((r) => r.included)
    // "Clean" = all key lines present AND within time limit
    const clean = allIncluded && timeMs <= timeLimit * 1000
    onComplete?.({ correct: allIncluded, clean, timeMs })
  }

  function handleReveal() {
    setRevealed(true)
  }

  return (
    <motion.div
      className="drill-card drill-card--routine"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="drill-card__header">
        <span className="drill-card__track-label">✍ Routine Writer</span>
        <span className={`drill-card__timer${urgent ? ' drill-card__timer--urgent' : ''}`}>
          {submitted ? '—' : `${remaining}s`}
        </span>
      </div>

      <p className="drill-card__question">{track.questionText}</p>

      <textarea
        className="drill-card__code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={submitted}
        spellCheck={false}
        rows={Math.max(10, code.split('\n').length + 2)}
      />

      {!submitted && (
        <div className="drill-card__actions">
          <button
            type="button"
            className="drill-card__submit-btn"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}

      {submitted && results && (
        <div className="drill-card__checklist">
          <h4 className="drill-card__checklist-title">Key lines checklist:</h4>
          <ul>
            {results.map((r, i) => (
              <li key={i} className={`drill-card__check-item ${r.included ? 'drill-card__check-item--ok' : 'drill-card__check-item--missing'}`}>
                <span className="drill-card__check-icon">{r.included ? '✓' : '✗'}</span>
                <span>
                  <code>{r.line}</code>
                  {!r.included && (
                    <span className="drill-card__check-note"> — {r.description}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {!revealed && (
            <button
              type="button"
              className="drill-card__reveal-btn"
              onClick={handleReveal}
            >
              Show canonical solution
            </button>
          )}

          {revealed && (
            <div className="drill-card__canonical">
              <h4>Canonical solution:</h4>
              <pre className="drill-card__code-pre">{track.canonicalCode}</pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
