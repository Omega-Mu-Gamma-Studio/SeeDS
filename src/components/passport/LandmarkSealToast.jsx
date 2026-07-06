import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgressStore } from '../../store/progressStore.js'
import { useCousin } from '../../hooks/useCousin.js'
import { lessonService } from '../../services/lessonService.js'
import './LandmarkSealToast.css'

const AUTO_DISMISS_MS = 4200

/**
 * The "sealing a landmark" moment. Mirrors CousinUnlockToast's one-shot
 * pendingCelebration pattern, but fires off progressStore.pendingSeal
 * instead -- because sealing happens inside completeLesson(), which runs
 * from LessonPage, not from inside the Passport itself. Mounting this at
 * the AppLayout level means the celebration plays no matter which screen
 * the person is on when the last lesson in a landmark lands, rather than
 * only being visible if they happen to have the Passport open already.
 */
export default function LandmarkSealToast() {
  const pendingSeal = useProgressStore((s) => s.pendingSeal)
  const clearSealCelebration = useProgressStore((s) => s.clearSealCelebration)
  const { currentCousin } = useCousin()

  const landmark = pendingSeal ? lessonService.getLandmarkById(pendingSeal) : null

  useEffect(() => {
    if (!pendingSeal) return undefined
    const t = setTimeout(clearSealCelebration, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [pendingSeal, clearSealCelebration])

  return (
    <AnimatePresence>
      {landmark && (
        <motion.div
          className="seal-toast__scrim"
          role="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearSealCelebration}
        >
          <motion.div
            className="seal-toast__card"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="seal-toast__eyebrow">Landmark sealed</span>
            <h3 className="seal-toast__landmark-name">{landmark.name}</h3>

            <motion.div
              className="seal-toast__stamp-wrap"
              initial={{ scale: 2.4, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 340, damping: 14 }}
            >
              <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true">
                <circle cx="60" cy="60" r="54" fill="var(--accent-primary)" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--accent-primary-ink)" strokeWidth="2" strokeOpacity="0.35" />
                <circle cx="60" cy="60" r="44" fill="none" stroke="var(--accent-primary-ink)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 4" />
                <text x="60" y="70" textAnchor="middle" fontSize="36" fill="var(--accent-primary-ink)" fontFamily="var(--font-body)" fontWeight="700">
                  {(currentCousin?.name || 'A')[0]}
                </text>
              </svg>
            </motion.div>

            <p className="seal-toast__quip">
              &ldquo;{currentCousin?.catchphrase || 'Let\u2019s get this figured out, step by step.'}&rdquo;
              <span className="seal-toast__quip-attr"> &mdash; {currentCousin?.name || 'The Narrator'}</span>
            </p>

            <button className="seal-toast__dismiss" onClick={clearSealCelebration}>
              Nice
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
