import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStoryStore } from '../../store/storyStore.js'
import { storyService } from '../../services/storyService.js'
import './FieldBadgeToast.css'

const AUTO_DISMISS_MS = 4200

/**
 * Fires whenever storyStore.visitLocation() sets a new pendingBadge --
 * the "found this place" moment (Story_Mode.md §1). Directly mirrors
 * CousinUnlockToast/LandmarkSealToast's one-shot pendingCelebration
 * pattern, mounted at the AppLayout level so it plays no matter which
 * screen a student navigates away to right after the visit.
 */
export default function FieldBadgeToast() {
  const pendingBadge = useStoryStore((s) => s.pendingBadge)
  const clearBadgeCelebration = useStoryStore((s) => s.clearBadgeCelebration)

  const location = pendingBadge ? storyService.getLocation(pendingBadge) : null

  useEffect(() => {
    if (!pendingBadge) return undefined
    const t = setTimeout(clearBadgeCelebration, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [pendingBadge, clearBadgeCelebration])

  return (
    <AnimatePresence>
      {location && (
        <motion.div
          className="field-badge-toast"
          role="status"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <span className="field-badge-toast__icon" aria-hidden="true">&#10022;</span>
          <div className="field-badge-toast__text">
            <span className="field-badge-toast__eyebrow">Field Badge earned</span>
            <span className="field-badge-toast__name">{location.badge.name}</span>
            <span className="field-badge-toast__location">{location.name}</span>
          </div>
          <button
            className="field-badge-toast__close"
            onClick={clearBadgeCelebration}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
