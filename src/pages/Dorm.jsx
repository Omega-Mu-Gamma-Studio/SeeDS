import SceneFrame from '../components/campus/SceneFrame.jsx'
import Hotspot from '../components/campus/Hotspot.jsx'
import { SCENE_ART } from '../components/campus/art.js'
import { usePassport } from '../hooks/usePassport.js'
import './Dorm.css'

/**
 * The Dorm is the "quiet room" -- the campus-map's equivalent of the
 * rest-stop/campfire beat. Right now it does exactly one thing: the
 * desk hotspot opens the same Passport panel as the global FAB (via the
 * shared usePassport hook, so there's only ever one source of truth for
 * "is the passport open"). More can live here later without touching
 * how it's reached.
 */
export default function Dorm() {
  const { openPassport } = usePassport()

  return (
    <div className="dorm-page">
      <SceneFrame
        art={SCENE_ART.dorm}
        title="Your Dorm Room"
        caption="Quiet for once. Your journal's on the desk, right where you left it."
        backTo="/campus"
        backLabel="Back to campus"
      >
        <Hotspot
          x={46}
          y={65}
          width={23}
          height={26}
          label="Your Journal"
          sublabel="Open Passport"
          onClick={openPassport}
        />
      </SceneFrame>
    </div>
  )
}
