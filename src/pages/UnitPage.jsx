import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lessonService } from '../services/lessonService.js'
import { useProgress } from '../hooks/useProgress.js'
import './UnitPage.css'

/**
 * Campus Map -- Master Doc section 6.2. Full illustrated-island art is still
 * TBD (AI-generated per section 7); until that asset exists, landmarks are
 * rendered as a syllabus-ordered path of hotspot cards so the map is fully
 * functional without depending on art. Swapping in the establishing-shot
 * background is purely a CSS background-image change later, not a
 * structural rewrite.
 */
export default function UnitPage() {
  const navigate = useNavigate()
  const { completedLessons } = useProgress()
  const units = lessonService.getAllUnits()
  const landmarks = units.flatMap((u) => (u.landmarks || []).map((lm) => ({ ...lm, unit: u.unit })))
  const [selected, setSelected] = useState(null)

  function statusFor(landmark) {
    const done = landmark.lessons.filter((id) => completedLessons.includes(id)).length
    if (done === landmark.lessons.length) return 'complete'
    if (done > 0) return 'in-progress'
    return 'unstarted'
  }

  const selectedLandmark = landmarks.find((l) => l.id === selected) || null

  return (
    <div className="campus-map">
      <div className="campus-map__bg" aria-hidden="true" />
      <h1>Campus Map</h1>
      <p className="campus-map__intro">Follow the path -- one island, one syllabus, seven landmarks.</p>

      <div className="campus-map__path">
        {landmarks.map((lm, i) => {
          const status = statusFor(lm)
          const doneCount = lm.lessons.filter((id) => completedLessons.includes(id)).length
          return (
            <button
              key={lm.id}
              className={`campus-map__hotspot campus-map__hotspot--${status}`}
              onClick={() => setSelected(selected === lm.id ? null : lm.id)}
            >
              <span className="campus-map__hotspot-index">{i + 1}</span>
              <span className="campus-map__hotspot-name">{lm.name}</span>
              <span className="campus-map__hotspot-meta">{doneCount}/{lm.lessons.length} lessons</span>
              {status === 'complete' && <span className="campus-map__hotspot-badge">sealed</span>}
            </button>
          )
        })}
      </div>

      {selectedLandmark && (
        <div className="campus-map__drilldown">
          <h2>{selectedLandmark.name}</h2>
          <p>{selectedLandmark.visualHook}</p>
          <ul className="campus-map__lesson-list">
            {selectedLandmark.lessons.map((lid) => {
              const lesson = lessonService.getLesson(lid)
              const done = completedLessons.includes(lid)
              return (
                <li key={lid}>
                  <button className="campus-map__lesson-btn" onClick={() => navigate(`/lesson/${lid}`)}>
                    <span>{done ? 'done' : 'open'}</span>
                    <span className="campus-map__lesson-id">{lid}</span>
                    <span>{lesson ? lesson.title : ''}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
