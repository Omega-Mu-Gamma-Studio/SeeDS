import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { lessonService } from '../../services/lessonService.js'
import { useProgress } from '../../hooks/useProgress.js'
import { useCousin } from '../../hooks/useCousin.js'
import CousinAvatar from '../cousin/CousinAvatar.jsx'
import { rankTitleForLevel, nextRankAt } from '../../utils/rankTitles.js'
import './Passport.css'

// Landmark id -> a small set of CSS-only motifs standing in for real
// landmark art until illustrated assets exist. Keyed off id so this is a
// pure lookup, never a guess -- unknown ids fall back to '__default'.
const LANDMARK_MOTIF = {
  'chainworks': 'motif-chain',
  'stack-queue-yard': 'motif-stack',
  'grove-of-rotations': 'motif-grove',
  'heap-observatory': 'motif-observatory',
  'bridge-district': 'motif-bridge',
  'hash-market': 'motif-market',
  'sorting-stadium': 'motif-stadium',
}

function motifFor(id) {
  return LANDMARK_MOTIF[id] || 'motif-default'
}

export default function PassportPanel({ open, onClose }) {
  const { stamps, totalXP, levelInfo, streak } = useProgress()
  const { currentCousin } = useCousin()
  const units = lessonService.getAllUnits()

  const [page, setPage] = useState(0)
  const lastPage = units.length

  // Note: this component resets to page 0 on every fresh mount. The parent
  // (AppLayout) should remount it on open (e.g. `key={passportOpen}`) so it
  // never reopens mid-book from a stale visit -- see PassportPanel usage.

  const rankTitle = rankTitleForLevel(levelInfo.level)
  const nextAt = nextRankAt(levelInfo.level)

  const totalLandmarks = useMemo(
    () => units.reduce((sum, u) => sum + (u.landmarks?.length || 0), 0),
    [units]
  )
  const sealedCount = useMemo(
    () => Object.values(stamps).filter((s) => s.sealed).length,
    [stamps]
  )

  function goTo(next) {
    setPage(Math.max(0, Math.min(lastPage, next)))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="passport-panel__scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="passport-panel__center">
          <motion.div
            className="passport-book"
            role="dialog"
            aria-label="Student Passport"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="passport-book__cover-edge" aria-hidden="true" />

            <header className="passport-book__chrome">
              <div className="passport-book__eyebrow-block">
                <span className="passport-book__eyebrow">Academy Records &middot; No. 2.0</span>
                <h2>Student Passport</h2>
              </div>
              <button className="passport-book__close" onClick={onClose} aria-label="Close passport">&#10005;</button>
            </header>

            <nav className="passport-book__tabs" aria-label="Passport pages">
              <button
                className={`passport-book__tab${page === 0 ? ' passport-book__tab--active' : ''}`}
                onClick={() => goTo(0)}
              >
                Record
              </button>
              {units.map((u, i) => (
                <button
                  key={u.unit}
                  className={`passport-book__tab${page === i + 1 ? ' passport-book__tab--active' : ''}`}
                  onClick={() => goTo(i + 1)}
                  title={u.title}
                >
                  {String(u.unit).padStart(2, '0')}
                </button>
              ))}
            </nav>

            <div className="passport-book__spread-wrap">
              <AnimatePresence mode="wait" initial={false}>
                {page === 0 ? (
                  <motion.div
                    key="record"
                    className="passport-book__spread passport-book__spread--record"
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 18 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="passport-record__left">
                      <CousinAvatar cousin={currentCousin} expression="teaching" size="md" />
                      <span className="passport-record__eyebrow">Student Record</span>
                      <h3 className="passport-record__title">{rankTitle}</h3>
                      <p className="passport-record__advisor">
                        Advisor of record: <strong>{currentCousin?.name || 'The Narrator'}</strong>
                      </p>
                      <blockquote className="passport-record__catchphrase">
                        &ldquo;{currentCousin?.catchphrase || 'Let\u2019s get this figured out, step by step.'}&rdquo;
                      </blockquote>
                    </div>
                    <div className="passport-record__right">
                      <div className="passport-record__stat-row">
                        <span>Level {levelInfo.level}</span>
                        <span>{nextAt ? `Next rank at Lv. ${nextAt}` : 'Top rank reached'}</span>
                      </div>
                      <div className="passport-record__xp-track" role="progressbar"
                        aria-valuenow={levelInfo.percent} aria-valuemin={0} aria-valuemax={100}>
                        <motion.div
                          className="passport-record__xp-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${levelInfo.percent}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="passport-record__xp-label">{levelInfo.current} / {levelInfo.total} XP to next rank</span>

                      <div className="passport-record__tiles">
                        <div className="passport-record__tile">
                          <span className="passport-record__tile-value">{totalXP}</span>
                          <span className="passport-record__tile-label">Total XP</span>
                        </div>
                        <div className="passport-record__tile">
                          <span className="passport-record__tile-value">{streak}</span>
                          <span className="passport-record__tile-label">Day streak</span>
                        </div>
                        <div className="passport-record__tile">
                          <span className="passport-record__tile-value">{sealedCount}/{totalLandmarks}</span>
                          <span className="passport-record__tile-label">Landmarks sealed</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  (() => {
                    const unit = units[page - 1]
                    return (
                      <motion.div
                        key={unit.unit}
                        className="passport-book__spread"
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -18 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div className="passport-page passport-page--left">
                          <span className="passport-page__eyebrow">Unit {String(unit.unit).padStart(2, '0')}</span>
                          <h3 className="passport-page__unit-title">{unit.title}</h3>
                          {unit.landmarks.map((lm) => (
                            <div key={lm.id} className={`passport-landmark-art ${motifFor(lm.id)}`}>
                              <div className="passport-landmark-art__glyph" aria-hidden="true" />
                              <p className="passport-landmark-art__hook">{lm.visualHook}</p>
                            </div>
                          ))}
                        </div>

                        <div className="passport-page passport-page--right">
                          {unit.landmarks.map((lm) => {
                            const entry = stamps[lm.id] || { lessonsDone: [], sealed: false }
                            return (
                              <div
                                key={lm.id}
                                className={`passport-panel__page${entry.sealed ? ' passport-panel__page--sealed' : ''}`}
                              >
                                <div className="passport-panel__page-header">
                                  <span className="passport-panel__landmark-name">{lm.name}</span>
                                  {entry.sealed && (
                                    <motion.span
                                      className="passport-panel__wax-seal"
                                      title={`Sealed by ${currentCousin?.name || 'your advisor'}`}
                                      initial={{ scale: 1.8, opacity: 0, rotate: -20 }}
                                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                      transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                                    >
                                      <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
                                        <circle cx="20" cy="20" r="18" fill="var(--accent-primary)" />
                                        <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent-primary-ink)" strokeWidth="1" strokeOpacity="0.4" />
                                        <text x="20" y="25" textAnchor="middle" fontSize="14" fill="var(--accent-primary-ink)" fontFamily="var(--font-body)">
                                          {(currentCousin?.name || 'A')[0]}
                                        </text>
                                      </svg>
                                    </motion.span>
                                  )}
                                </div>
                                <p className="passport-panel__topics">{lm.topics.join(' \u00b7 ')}</p>
                                <div className="passport-panel__stamps">
                                  {lm.lessons.map((lid) => {
                                    const done = entry.lessonsDone.includes(lid)
                                    return (
                                      <span
                                        key={lid}
                                        className={`passport-panel__stamp${done ? ' passport-panel__stamp--done' : ''}`}
                                        title={lid}
                                      >
                                        {done ? '\u2713' : lid}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )
                  })()
                )}
              </AnimatePresence>
            </div>

            <footer className="passport-book__footer">
              <button
                className="passport-book__nav"
                onClick={() => goTo(page - 1)}
                disabled={page === 0}
                aria-label="Previous page"
              >
                &#8592; Prev
              </button>
              <span className="passport-book__page-indicator">
                {page === 0 ? 'Student Record' : `Unit ${page} of ${lastPage}`}
              </span>
              <button
                className="passport-book__nav"
                onClick={() => goTo(page + 1)}
                disabled={page === lastPage}
                aria-label="Next page"
              >
                Next &#8594;
              </button>
            </footer>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
