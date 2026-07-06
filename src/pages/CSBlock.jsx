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
  const [lectureHallOpen, setLectureHallOpen] = useState(false)
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
  const doneCount = doors.filter((d) => d.status === 'complete').length

  function handleLandmarkClick(door) {
    if (door.locked) return
    // First lesson behind the landmark -- not-yet-done one if mid-landmark,
    // otherwise just the first. Keeps a single click meaningful even
    // once a landmark has several lessons behind it.
    const target = door.lessons.find((lid) => !completedLessons.includes(lid)) || door.lessons[0]
    navigate(`/lesson/${target}`)
  }

  return (
    <div className="cs-block-page">
      <SceneFrame
        art={SCENE_ART.csBlock}
        title="CS Department -- Ground Floor"
        caption="One lecture hall teaches every unit. The other door is just the staff."
        backTo="/campus"
        backLabel="Back to campus"
      >
        <Hotspot
          x={3}
          y={5}
          width={19}
          height={73}
          label="Lecture Hall"
          sublabel={`${doneCount}/${doors.length} landmarks`}
          current
          onClick={() => setLectureHallOpen(true)}
        />

        <Hotspot
          x={34}
          y={5}
          width={16}
          height={67}
          label="Staff Room"
          sublabel="Switch advisor"
          onClick={() => setStaffRoomOpen(true)}
        />
      </SceneFrame>

      {lectureHallOpen && (
        <div className="cs-block-staffroom" role="dialog" aria-label="Lecture hall">
          <div className="cs-block-staffroom__scrim" onClick={() => setLectureHallOpen(false)} />
          <div className="cs-block-staffroom__panel">
            <div className="cs-block-staffroom__header">
              <h2>The Lecture Hall</h2>
              <button onClick={() => setLectureHallOpen(false)} aria-label="Leave the lecture hall">✕</button>
            </div>
            <p className="cs-block-staffroom__sub">
              Same room, every unit -- pick a landmark to jump into its lessons.
            </p>
            <ul className="lecture-hall__list">
              {doors.map((door) => (
                <li key={door.id}>
                  <button
                    type="button"
                    className={[
                      'lecture-hall__row',
                      door.locked ? 'lecture-hall__row--locked' : '',
                      door === current ? 'lecture-hall__row--current' : '',
                      door.status === 'complete' ? 'lecture-hall__row--complete' : '',
                    ].join(' ').trim()}
                    disabled={door.locked}
                    onClick={() => {
                      handleLandmarkClick(door)
                      setLectureHallOpen(false)
                    }}
                  >
                    <span className="lecture-hall__row-icon" aria-hidden="true">
                      {door.locked ? '🔒' : door.status === 'complete' ? '📜' : '🚪'}
                    </span>
                    <span className="lecture-hall__row-text">
                      <span className="lecture-hall__row-name">{door.name}</span>
                      <span className="lecture-hall__row-sub">
                        {door.locked
                          ? `${door.name} -- come back once the previous landmark is sealed.`
                          : `${door.lessons.filter((id) => completedLessons.includes(id)).length}/${door.lessons.length} lessons`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
