import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCousinStore } from '../../store/cousinStore.js'
import { useCousin } from '../../hooks/useCousin.js'
import CousinAvatar from './CousinAvatar.jsx'
import './CousinUnlockToast.css'

const AUTO_DISMISS_MS = 5000
const CONFETTI = ['✦', '✧', '★', '🎉']

/**
 * Fires whenever cousinStore.unlockCousin() sets a new pendingCelebration.
 * Nothing in the app currently calls unlockCousin (every cousin ships
 * unlocked by default in cousinStore's initial state) -- this is the
 * missing "unlock moment" plumbing so the celebration exists the moment
 * a real gating trigger is wired up.
 */
export default function CousinUnlockToast() {
  const pendingCelebration = useCousinStore((s) => s.pendingCelebration)
  const clearCelebration = useCousinStore((s) => s.clearCelebration)
  const { allCousins } = useCousin()

  const cousin = allCousins.find((c) => c.id === pendingCelebration)

  useEffect(() => {
    if (!pendingCelebration) return undefined
    const t = setTimeout(clearCelebration, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [pendingCelebration, clearCelebration])

  return (
    <AnimatePresence>
      {cousin && (
        <motion.div
          className="cousin-unlock-toast"
          role="status"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <div className="cousin-unlock-toast__confetti" aria-hidden="true">
            {CONFETTI.map((c, i) => (
              <span key={i} className="cousin-unlock-toast__confetti-piece" style={{ '--i': i }}>{c}</span>
            ))}
          </div>
          <CousinAvatar cousin={cousin} expression="excited" size="md" />
          <div className="cousin-unlock-toast__text">
            <span className="cousin-unlock-toast__eyebrow">New advisor unlocked!</span>
            <span className="cousin-unlock-toast__name">{cousin.name}</span>
          </div>
          <button
            className="cousin-unlock-toast__close"
            onClick={clearCelebration}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
