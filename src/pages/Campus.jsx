import { useNavigate } from 'react-router-dom'
import SceneFrame from '../components/campus/SceneFrame.jsx'
import Hotspot from '../components/campus/Hotspot.jsx'
import { SCENE_ART } from '../components/campus/art.js'
import './Campus.css'

/**
 * University overview. Only the CS Department and the Dorm are functional
 * right now -- SeeDS only teaches CS content. The other departments are
 * left visibly locked on purpose: they're a free, in-universe teaser for
 * the rest of the studio's apps (BlockBeats, GateLab/ArchVisor, etc). No
 * behavior needed beyond a tooltip until/unless those get wired in.
 */
export default function Campus() {
  const navigate = useNavigate()

  return (
    <div className="campus-page">
      <SceneFrame
        art={SCENE_ART.campus}
        title="The University"
        caption="One island, several departments, and only one of them teaches what you're actually here for."
        backTo="/island"
        backLabel="Back to the island"
      >
        <Hotspot
          x={4}
          y={20}
          width={35}
          height={58}
          label="CS Department"
          sublabel="Where SeeDS lives"
          current
          onClick={() => navigate('/campus/cs')}
        />
        <Hotspot
          x={59}
          y={16}
          width={38}
          height={58}
          label="The Dorms"
          sublabel="Passport, rest, breathe"
          onClick={() => navigate('/campus/dorm')}
        />
        <Hotspot
          x={40}
          y={2}
          width={17}
          height={18}
          label="The Conservatory"
          locked
          lockedReason="Closed for now. Word is someone's building something in there."
        />
        <Hotspot
          x={60}
          y={7}
          width={11}
          height={14}
          label="Engineering Hall"
          locked
          lockedReason="Closed for now."
        />
        <Hotspot
          x={85}
          y={4}
          width={12}
          height={16}
          label="Architecture Studio"
          locked
          lockedReason="Closed for now."
        />
      </SceneFrame>
    </div>
  )
}
