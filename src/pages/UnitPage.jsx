import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lessonService } from '../services/lessonService.js'
import { useProgress } from '../hooks/useProgress.js'
import './UnitPage.css'

/**
 * Campus Map -- Master Doc section 6.2. Full illustrated-island art is still
 * TBD (AI-generated per section 7); until that asset exists, landmarks are
 * rendered as a syllabus-ordered path of node-hotspots on a 2D canvas
 * (absolute-positioned, connected by a dashed SVG line) so the map reads as
 * a map even without art. Swapping in the establishing-shot background is
 * purely a CSS background-image change later, not a structural rewrite.
 */

const ROW_HEIGHT = 150
const ZIGZAG_X = [18, 50, 82] // percent, cycled per row

function statusFor(landmark, completedLessons) {
  const done = landmark.lessons.filter((id) => completedLessons.includes(id)).length
  if (done === landmark.lessons.length) return 'complete'
  if (done > 0) return 'in-progress'
  return 'unstarted'
}

export default function UnitPage() {
  const navigate = useNavigate()
  const { completedLessons } = useProgress()
  const units = lessonService.getAllUnits()
  const landmarks = units.flatMap((u) => (u.landmarks || []).map((lm) => ({ ...lm, unit: u.unit })))
  const [selected, setSelected] = useState(null)

  const nodes = landmarks.map((lm, i) => {
    const status = statusFor(lm, completedLessons)
    const prev = landmarks[i - 1]
    const prevStatus = prev ? statusFor(prev, completedLessons) : 'complete'
    const locked = i > 0 && prevStatus !== 'complete'
    return {
      ...lm,
      status,
      locked,
      x: ZIGZAG_X[i % ZIGZAG_X.length],
      y: i * ROW_HEIGHT + 70,
    }
  })

  const current = nodes.find((n) => !n.locked && n.status !== 'complete')
  const canvasHeight = nodes.length * ROW_HEIGHT + 40

  const selectedLandmark = nodes.find((l) => l.id === selected) || null

  function handleHotspotClick(node) {
    if (node.locked) return
    setSelected(selected === node.id ? null : node.id)
  }

  return (
    <div className="campus-map">
      <div className="campus-map__bg" aria-hidden="true" />
      <h1>Campus Map</h1>
      <p className="campus-map__intro">Follow the path -- one island, one syllabus, seven landmarks.</p>

      <div className="campus-map__canvas" style={{ height: canvasHeight }}>
        <svg
          className="campus-map__path-svg"
          viewBox={`0 0 100 ${canvasHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {nodes.slice(1).map((node, i) => {
            const prev = nodes[i]
            return (
              <line
                key={node.id}
                x1={prev.x}
                y1={prev.y}
                x2={node.x}
                y2={node.y}
                className={`campus-map__path-line${node.locked ? ' campus-map__path-line--locked' : ''}`}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        {nodes.map((node, i) => (
          <button
            key={node.id}
            className={[
              'campus-map__hotspot',
              `campus-map__hotspot--${node.status}`,
              node.locked ? 'campus-map__hotspot--locked' : '',
              node === current ? 'campus-map__hotspot--current' : '',
            ].join(' ').trim()}
            style={{ left: `${node.x}%`, top: node.y }}
            onClick={() => handleHotspotClick(node)}
            disabled={node.locked}
            aria-label={node.locked ? `${node.name} (locked)` : node.name}
          >
            <span className="campus-map__hotspot-node">
              {node.locked ? '🔒' : i + 1}
              {node === current && <span className="campus-map__hotspot-pulse" aria-hidden="true" />}
            </span>
            <span className="campus-map__hotspot-name">{node.name}</span>
            <span className="campus-map__hotspot-meta">
              {node.locked
                ? 'locked'
                : `${node.lessons.filter((id) => completedLessons.includes(id)).length}/${node.lessons.length} lessons`}
            </span>
          </button>
        ))}
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
