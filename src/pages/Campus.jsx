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
          x={30}
          y={45}
          label="CS Department"
          sublabel="Where SeeDS lives"
          icon="🖥️"
          current
          onClick={() => navigate('/campus/cs')}
        />
        <Hotspot
          x={62}
          y={62}
          label="The Dorms"
          sublabel="Passport, rest, breathe"
          icon="🛏️"
          onClick={() => navigate('/campus/dorm')}
        />
        <Hotspot
          x={55}
          y={22}
          label="The Conservatory"
          icon="🎵"
          locked
          lockedReason="Closed for now. Word is someone's building something in there."
        />
        <Hotspot
          x={78}
          y={35}
          label="Engineering Hall"
          icon="⚙️"
          locked
          lockedReason="Closed for now."
        />
        <Hotspot
          x={15}
          y={70}
          label="Architecture Studio"
          icon="📐"
          locked
          lockedReason="Closed for now."
        />
      </SceneFrame>
    </div>
  )
}
