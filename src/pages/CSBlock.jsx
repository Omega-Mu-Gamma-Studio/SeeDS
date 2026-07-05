import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SceneFrame from '../components/campus/SceneFrame.jsx'
import Hotspot from '../components/campus/Hotspot.jsx'
import { SCENE_ART } from '../components/campus/art.js'
import { lessonService } from '../services/lessonService.js'
import { useProgress } from '../hooks/useProgress.js'
import CousinPicker from '../components/cousin/CousinPicker.jsx'
import './CSBlock.css'

// Same "is this landmark done / is it locked" logic UnitPage already used --
// kept identical on purpose so the hallway and the (still-available)
// /campus-map power-nav never disagree about what's locked.
function statusFor(landmark, completedLessons) {
  const done = landmark.lessons.filter((id) => completedLessons.includes(id)).length
  if (done === landmark.lessons.length) return 'complete'
  if (done > 0) return 'in-progress'
  return 'unstarted'
}

export default function CSBlock() {
  const navigate = useNavigate()
  const { completedLessons } = useProgress()
  const [staffRoomOpen, setStaffRoomOpen] = useState(false)

  const units = lessonService.getAllUnits()
  const landmarks = units.flatMap((u) => (u.landmarks || []).map((lm) => ({ ...lm, unit: u.unit })))

  const doors = landmarks.map((lm, i) => {
    const status = statusFor(lm, completedLessons)
    const prev = landmarks[i - 1]
    const prevStatus = prev ? statusFor(prev, completedLessons) : 'complete'
    const locked = i > 0 && prevStatus !== 'complete'
    return { ...lm, status, locked }
  })

  const current = doors.find((d) => !d.locked && d.status !== 'complete')

  function handleDoorClick(door) {
    if (door.locked) return
    // First lesson behind the door -- not-yet-done one if mid-landmark,
    // otherwise just the first. Keeps a single click meaningful even
    // once a landmark has several lessons behind its door.
    const target = door.lessons.find((lid) => !completedLessons.includes(lid)) || door.lessons[0]
    navigate(`/lesson/${target}`)
  }

  // Doors laid out in a single row the player "walks down." Overflow
  // scrolls horizontally -- fine for now with a handful of landmarks,
  // and doesn't require knowing the total count up front.
  const doorSpacing = 100 / (doors.length + 1)

  return (
    <div className="cs-block-page">
      <SceneFrame
        art={SCENE_ART.csBlock}
        title="CS Department -- Ground Floor"
        caption="One door is unlocked. The rest are still waiting their turn."
        backTo="/campus"
        backLabel="Back to campus"
      >
        {doors.map((door, i) => (
          <Hotspot
            key={door.id}
            variant="door"
            x={doorSpacing * (i + 1)}
            y={55}
            label={door.name}
            sublabel={
              door.locked
                ? undefined
                : `${door.lessons.filter((id) => completedLessons.includes(id)).length}/${door.lessons.length} lessons`
            }
            icon={door.status === 'complete' ? '📜' : '🚪'}
            locked={door.locked}
            current={door === current}
            lockedReason={`${door.name} -- come back once the previous hall is sealed.`}
            onClick={() => handleDoorClick(door)}
          />
        ))}

        <Hotspot
          variant="door"
          x={doorSpacing * (doors.length + 1) > 92 ? 6 : 94}
          y={55}
          label="Staff Room"
          sublabel="Switch advisor"
          icon="🧑‍🏫"
          onClick={() => setStaffRoomOpen(true)}
        />
      </SceneFrame>

      {staffRoomOpen && (
        <div className="cs-block-staffroom" role="dialog" aria-label="Staff room">
          <div className="cs-block-staffroom__scrim" onClick={() => setStaffRoomOpen(false)} />
          <div className="cs-block-staffroom__panel">
            <div className="cs-block-staffroom__header">
              <h2>The Staff Room</h2>
              <button onClick={() => setStaffRoomOpen(false)} aria-label="Leave the staff room">✕</button>
            </div>
            <p className="cs-block-staffroom__sub">
              Every advisor here teaches the exact same material -- pick whoever you want walking you through it.
            </p>
            <CousinPicker context="settings" onConfirm={() => setStaffRoomOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
