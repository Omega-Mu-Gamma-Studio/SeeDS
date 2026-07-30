import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCousinStore } from '../store/cousinStore.js'
import { useProgress } from '../hooks/useProgress.js'
import { lessonService } from '../services/lessonService.js'
import { storyService } from '../services/storyService.js'
import { unitsCompleted } from '../utils/unitsCompleted.js'
import SceneFrame from '../components/campus/SceneFrame.jsx'
import Hotspot from '../components/campus/Hotspot.jsx'
import { SCENE_ART } from '../components/campus/art.js'
import './Island.css'

/**
 * Top of the campus-map hierarchy: Island -> Campus -> CS Block -> Dorm.
 * Also carries the Story Mode locations (Story_Mode.md) as a second layer
 * of hotspots on the same establishing shot -- the University hotspot is
 * unrelated to Story Mode and unaffected by any of this.
 *
 * Also the landing page for a fresh advisor pick (App.jsx redirects "/" here
 * once, right after onboarding) -- so this is where the one-shot
 * justOnboarded flag gets consumed and cleared.
 */
export default function Island() {
  const navigate = useNavigate()
  const clearJustOnboarded = useCousinStore((s) => s.clearJustOnboarded)
  const { completedLessons } = useProgress()

  useEffect(() => {
    clearJustOnboarded()
  }, [clearJustOnboarded])

  const progressUnits = useMemo(
    () => unitsCompleted(lessonService.getAllUnits(), completedLessons),
    [completedLessons]
  )
  const locations = useMemo(() => storyService.getAllLocations(), [])

  return (
    <div className="island-page">
      <SceneFrame
        art={SCENE_ART.island}
        title="Somewhere, an island"
        caption="Gothic spires up on the cliff. Everything else down here pretends that's normal."
      >
        <Hotspot
          x={43}
          y={40}
          width={17}
          height={22}
          label="The University"
          sublabel="Est. a long time ago, apparently"
          onClick={() => navigate('/campus')}
        />

        {locations.map((loc) => {
          // Locked purely off Story_Mode.md's own pacing rule (§1): a
          // location unlocks once units-completed reaches its lowest beat's
          // unlocksAtUnit. Every location currently ships with a Unit-0
          // beat, so in practice these are all open from the start -- "no
          // forced quests," per the doc -- but the gate is real and data-
          // driven, not hardcoded open, so a future location can ship with
          // a delayed reveal without any code change.
          const minUnit = storyService.minUnlockUnit(loc)
          const locked = progressUnits < minUnit
          return (
            <Hotspot
              key={loc.id}
              x={loc.hotspot.x}
              y={loc.hotspot.y}
              width={loc.hotspot.width}
              height={loc.hotspot.height}
              label={loc.name}
              sublabel={loc.sublabel}
              locked={locked}
              lockedReason="Comes into view later in the semester"
              onClick={() => navigate(`/island/${loc.id}`)}
            />
          )
        })}
      </SceneFrame>
    </div>
  )
}
