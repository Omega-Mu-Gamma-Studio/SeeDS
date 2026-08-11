import { useNavigate } from 'react-router-dom'
import SceneFrame from '../components/campus/SceneFrame.jsx'
import Hotspot from '../components/campus/Hotspot.jsx'
import { SCENE_ART } from '../components/campus/art.js'
import { usePassport } from '../hooks/usePassport.js'
import './Dorm.css'

/**
 * The Dorm is the "quiet room" -- the campus-map's equivalent of the
 * rest-stop/campfire beat. The desk hotspot opens the same Passport panel
 * as the global FAB (via the shared usePassport hook, so there's only ever
 * one source of truth for "is the passport open"). The lit desk-lamp corner
 * (lamp + stacked books + mug, opposite side of the desk from the journal)
 * is Lock-In Mode -- moved here from a bare CS-block hallway slot because
 * "pull an all-nighter with coffee and a stack of exam prep" is the actual
 * beat, not a random hallway door. More can live here later without
 * touching how it's reached.
 */
export default function Dorm() {
  const { openPassport } = usePassport()
  const navigate = useNavigate()

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

        <Hotspot
          x={70}
          y={42}
          width={29}
          height={55}
          label="Lock-In Mode"
          sublabel="Exam drills — Units 1 & 2"
          onClick={() => navigate('/drill')}
        />
      </SceneFrame>
    </div>
  )
}
