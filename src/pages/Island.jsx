import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCousinStore } from '../store/cousinStore.js'
import SceneFrame from '../components/campus/SceneFrame.jsx'
import Hotspot from '../components/campus/Hotspot.jsx'
import { SCENE_ART } from '../components/campus/art.js'
import './Island.css'

/**
 * Top of the campus-map hierarchy: Island -> Campus -> CS Block -> Lesson.
 * Right now this is a single establishing shot with one hotspot. Later,
 * this is also the natural home for a beach/marina area if that ever
 * becomes its own explorable thing (not needed for the CS subject).
 *
 * Also the landing page for a fresh advisor pick (App.jsx redirects "/" here
 * once, right after onboarding) -- so this is where the one-shot
 * justOnboarded flag gets consumed and cleared.
 */
export default function Island() {
  const navigate = useNavigate()
  const clearJustOnboarded = useCousinStore((s) => s.clearJustOnboarded)

  useEffect(() => {
    clearJustOnboarded()
  }, [clearJustOnboarded])

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
      </SceneFrame>
    </div>
  )
}
