import { motion } from 'framer-motion'
import { useState } from 'react'

/**
 * Phase 5 grading is intentionally simple (PRD §4): exact match against a
 * single correct answer, up to 3 attempts with an escalating hint from
 * hints[] before revealing solution.
 */
export default function Phase5Test({ phase, onComplete }) {
  const [attempt, setAttempt] = useState('')
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'incorrect' | null
  const [revealed, setRevealed] = useState(false)

  if (!phase) return null

  const maxAttempts = 3
  const hintIndex = Math.min(attemptsUsed, phase.hints.length - 1)

  function normalize(s) {
    return String(s).trim().toLowerCase()
  }

  function checkAnswer() {
    const correct = normalize(attempt) === normalize(phase.answer)
    if (correct) {
      setFeedback('correct')
      onComplete && onComplete(true)
    } else {
      const nextAttempts = attemptsUsed + 1
      setAttemptsUsed(nextAttempts)
      setFeedback('incorrect')
      if (nextAttempts >= maxAttempts) {
        setRevealed(true)
      }
    }
  }

  return (
    <motion.div
      className="phase-content phase-content--test"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
    >
      <h3>Test</h3>
      <p className="phase-content__question">{phase.question}</p>

      {!revealed && (
        <div className="phase-content__answer-row">
          <input
            type="text"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="Your answer..."
            className="phase-content__answer-input"
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          />
          <button type="button" className="phase-content__submit-btn" onClick={checkAnswer}>
            Submit
          </button>
        </div>
      )}

      {feedback === 'correct' && (
        <p className="phase-content__feedback phase-content__feedback--correct">
          ✓ Correct! Nice work.
        </p>
      )}

      {feedback === 'incorrect' && !revealed && (
        <p className="phase-content__feedback phase-content__feedback--incorrect">
          Not quite. Hint: {phase.hints[hintIndex]}
        </p>
      )}

      {revealed && (
        <div className="phase-content__solution">
          <p className="phase-content__feedback phase-content__feedback--incorrect">
            Here's the solution:
          </p>
          <p>{phase.solution}</p>
        </div>
      )}
    </motion.div>
  )
}
