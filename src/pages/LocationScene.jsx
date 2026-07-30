import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SceneFrame from '../components/campus/SceneFrame.jsx'
import SpeechBubble from '../components/cousin/SpeechBubble.jsx'
import { storyService } from '../services/storyService.js'
import { lessonService } from '../services/lessonService.js'
import { useProgress } from '../hooks/useProgress.js'
import { useStoryStore } from '../store/storyStore.js'
import { unitsCompleted } from '../utils/unitsCompleted.js'
import './LocationScene.css'

/**
 * Route wrapper: keying on locationId forces a fresh LocationScene mount
 * per location, so its "what's new this visit" snapshot (see
 * initialSeenBeatIds below) never bleeds from one location into the next
 * when navigating Island -> Ruins -> back -> Landing without a full page
 * reload.
 */
export default function LocationSceneRoute() {
  const { locationId } = useParams()
  return <LocationScene key={locationId} locationId={locationId} />
}

/**
 * A single Story Mode location (Story_Mode.md §4). Mirrors the
 * Campus.jsx/SceneFrame full-bleed pattern, then adds two pieces below the
 * art: a Journal panel (whichever beats units-completed has unlocked, ever
 * seen, newest first) and -- if the location has an associated NPC -- the
 * same avatar+SpeechBubble row PhaseContainer uses, advancing one dialogue
 * layer per visit.
 *
 * Entirely optional content: nothing here blocks navigation, and a student
 * who never visits loses nothing functional (Story_Mode.md §1).
 */
function LocationScene({ locationId }) {
  const navigate = useNavigate()
  const { completedLessons } = useProgress()

  const visitLocation = useStoryStore((s) => s.visitLocation)
  const markBeatSeen = useStoryStore((s) => s.markBeatSeen)
  const advanceNpcLayer = useStoryStore((s) => s.advanceNpcLayer)
  const setNpcChoice = useStoryStore((s) => s.setNpcChoice)
  const seenBeatIds = useStoryStore((s) => s.seenBeatIds)
  const npcLayerSeen = useStoryStore((s) => s.npcLayerSeen)
  const npcChoices = useStoryStore((s) => s.npcChoices)

  const location = useMemo(() => storyService.getLocation(locationId), [locationId])
  const npc = useMemo(() => storyService.getNpc(location?.npcId), [location])

  const progressUnits = useMemo(
    () => unitsCompleted(lessonService.getAllUnits(), completedLessons),
    [completedLessons]
  )

  // Snapshot of seenBeatIds from *before* this visit's effect runs, taken
  // once via lazy useState init (not a ref -- refs can't be read during
  // render). Comparing live unlockedBeats against this frozen snapshot at
  // render time is what flags a beat "New" for exactly one visit, without
  // ever calling setState from inside the effect below. The route wrapper
  // above remounts this component per locationId, so the snapshot is
  // always retaken fresh on a new visit.
  const [initialSeenBeatIds] = useState(() => useStoryStore.getState().seenBeatIds)

  useEffect(() => {
    if (!location) return
    visitLocation(location.id)

    const unlocked = storyService.unlockedBeats(location, progressUnits, seenBeatIds)
    unlocked
      .filter((b) => !seenBeatIds.includes(b.id))
      .forEach((b) => markBeatSeen(b.id))

    if (npc) {
      advanceNpcLayer(npc.id, npc.layers.length)
    }
    // Deliberately keyed only on locationId -- this is a "you walked in"
    // event, not something that should re-fire as progress/store values
    // change out from under the same visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId])

  if (!location) {
    return (
      <div className="location-scene-page">
        <p>That place isn't on the map.</p>
        <button type="button" onClick={() => navigate('/island')}>Back to the island</button>
      </div>
    )
  }

  const unlockedBeats = storyService.unlockedBeats(location, progressUnits, seenBeatIds)
  const journalEntries = unlockedBeats
    .filter((b) => seenBeatIds.includes(b.id))
    .sort((a, b) => (a.unlocksAtUnit ?? 0) - (b.unlocksAtUnit ?? 0))

  const dialogueLayer = npc ? npcLayerSeen[npc.id] : null
  const activeLayer = npc && dialogueLayer
    ? npc.layers[Math.min(dialogueLayer, npc.layers.length) - 1]
    : null
  const npcChoice = npc ? npcChoices[npc.id] : null
  const showTinyChoice = Boolean(activeLayer?.tinyChoice) && !npcChoice
  const justRevealed = journalEntries
    .filter((b) => !initialSeenBeatIds.includes(b.id))
    .map((b) => b.id)

  return (
    <div className="location-scene-page">
      <SceneFrame
        art={`url('${location.art}') center/cover`}
        title={location.name}
        caption={location.flavor}
        backTo="/island"
        backLabel="Back to the island"
      />

      <div className="location-scene__panels">
        <section className="location-journal" aria-label={`${location.name} journal`}>
          <span className="location-journal__eyebrow">Journal</span>
          {journalEntries.length === 0 && (
            <p className="location-journal__empty">Nothing written down yet. Come back later in the semester.</p>
          )}
          <ul className="location-journal__list">
            {journalEntries.map((entry) => (
              <li
                key={entry.id}
                className={`location-journal__entry${justRevealed.includes(entry.id) ? ' location-journal__entry--new' : ''}`}
              >
                <div className="location-journal__entry-head">
                  <h3>{entry.title}</h3>
                  {justRevealed.includes(entry.id) && <span className="location-journal__new-tag">New</span>}
                </div>
                <p>{entry.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {npc && activeLayer && (
          <section className="location-npc" aria-label={`${npc.name}`}>
            <div className="location-npc__row">
              <div className="location-npc__portrait">
                {npc.portrait ? (
                  <img src={npc.portrait} alt={npc.name} loading="lazy" />
                ) : (
                  <span className="location-npc__initial">{npc.name[0]}</span>
                )}
              </div>
              <SpeechBubble text={activeLayer.text} />
            </div>

            <AnimatePresence>
              {showTinyChoice && (
                <motion.div
                  className="location-npc__tiny-choice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <button
                    type="button"
                    className="location-npc__choice-btn"
                    onClick={() => setNpcChoice(npc.id, 'friendship')}
                  >
                    {activeLayer.tinyChoice.friendship}
                  </button>
                  <button
                    type="button"
                    className="location-npc__choice-btn location-npc__choice-btn--romance"
                    onClick={() => setNpcChoice(npc.id, 'romance')}
                  >
                    {activeLayer.tinyChoice.romance}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {npcChoice && (
              <p className="location-npc__choice-made">
                {npcChoice === 'romance'
                  ? `You and ${npc.name} decided to see where this goes.`
                  : `You and ${npc.name} are close friends now.`}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
