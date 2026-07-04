import { NavLink } from 'react-router-dom'
import { lessonService } from '../../services/lessonService.js'
import { useProgress } from '../../hooks/useProgress.js'
import { useUIStore } from '../../store/uiStore.js'
import './Sidebar.css'

export default function Sidebar({ open }) {
  const units = lessonService.getAllUnits()
  const { completedLessons } = useProgress()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <>
      <aside className={`sidebar${open ? '' : ' sidebar--collapsed'}`}>
        <div className="sidebar__header">
          <NavLink to="/" className="sidebar__logo">SeeDS</NavLink>
          <button className="sidebar__collapse-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {open ? '‹' : '›'}
          </button>
        </div>
        {open && (
          <nav className="sidebar__nav">
            <NavLink to="/campus-map" className="sidebar__campus-link">
              🗺️ Campus Map
            </NavLink>
            {units.map((unit) => (
              <div key={unit.unit} className="sidebar__unit">
                <div className="sidebar__unit-title">Unit {unit.unit} — {unit.title}</div>
                <ul className="sidebar__lesson-list">
                  {unit.lessons.map((lessonId) => {
                    const lesson = lessonService.getLesson(lessonId)
                    if (!lesson) return null
                    const done = completedLessons.includes(lessonId)
                    return (
                      <li key={lessonId}>
                        <NavLink
                          to={`/lesson/${lessonId}`}
                          className={({ isActive }) =>
                            `sidebar__lesson-item${isActive ? ' sidebar__lesson-item--active' : ''}${done ? ' sidebar__lesson-item--done' : ''}`
                          }
                        >
                          <span className="sidebar__lesson-status">{done ? '✓' : '○'}</span>
                          <span className="sidebar__lesson-id">{lesson.id}</span>
                          <span className="sidebar__lesson-title">{lesson.title}</span>
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </aside>
    </>
  )
}
