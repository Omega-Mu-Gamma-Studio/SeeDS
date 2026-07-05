import { motion, AnimatePresence } from 'framer-motion'
import { lessonService } from '../../services/lessonService.js'
import { useProgress } from '../../hooks/useProgress.js'
import './Passport.css'

export default function PassportPanel({ open, onClose }) {
  const { stamps } = useProgress()
  const units = lessonService.getAllUnits()
  const landmarks = units.flatMap((u) => u.landmarks || [])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="passport-panel__scrim" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="passport-panel"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}>
            <div className="passport-panel__spine" aria-hidden="true" />
            <div className="passport-panel__header">
              <div>
                <span className="passport-panel__eyebrow">Academy Records · No. 2.0</span>
                <h2>Student Passport</h2>
              </div>
              <button onClick={onClose} aria-label="Close passport">✕</button>
            </div>
            <p className="passport-panel__subtitle">Stamped by the Academy itself — every advisor teaches here, but this record is yours.</p>
            <div className="passport-panel__pages">
              {landmarks.map((lm) => {
                const entry = stamps[lm.id] || { lessonsDone: [], sealed: false }
                return (
                  <div key={lm.id} className={`passport-panel__page${entry.sealed ? ' passport-panel__page--sealed' : ''}`}>
                    <div className="passport-panel__page-header">
                      <span className="passport-panel__landmark-name">{lm.name}</span>
                      {entry.sealed && <span className="passport-panel__wax-seal" title="Landmark sealed">🔶</span>}
                    </div>
                    <div className="passport-panel__stamps">
                      {lm.lessons.map((lid) => (
                        <span
                          key={lid}
                          className={`passport-panel__stamp${entry.lessonsDone.includes(lid) ? ' passport-panel__stamp--done' : ''}`}
                          title={lid}
                        >
                          {entry.lessonsDone.includes(lid) ? '★' : lid}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
