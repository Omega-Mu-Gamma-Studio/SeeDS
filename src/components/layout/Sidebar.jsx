import { NavLink } from 'react-router-dom'
import { lessonService } from '../../services/lessonService.js'
import { useProgress } from '../../hooks/useProgress.js'
import { useUIStore } from '../../store/uiStore.js'
import './Sidebar.css'

export default function Sidebar({ open }) {
  const units = lessonService.getAllUnits()
  const { completedLessons, totalXP, streak, levelInfo } = useProgress()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const allLessons = lessonService.getAllLessons()
  const nextLesson = allLessons.find((l) => !completedLessons.includes(l.id))

  return (
    <>
      <aside className={`sidebar${open ? '' : ' sidebar--collapsed'}`}>
        <div className="sidebar__header">
          {open && <NavLink to="/" className="sidebar__logo">SeeDS</NavLink>}
          <NavLink to="/settings" className="sidebar__settings-btn" aria-label="Settings" title="Settings">
            ⚙️
          </NavLink>
        </div>

        <button
          className="sidebar__collapse-tab"
          onClick={toggleSidebar}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open ? '‹' : '›'}
        </button>

        <div className="sidebar__hud">
          <span className="sidebar__hud-level" title={`${totalXP} XP total`}>Lvl {levelInfo.level}</span>
          {open && (
            <span className="sidebar__hud-streak" title="Day streak">🔥 {streak}</span>
          )}
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
                    const recommended = !done && nextLesson?.id === lessonId
                    return (
                      <li key={lessonId}>
                        <NavLink
                          to={`/lesson/${lessonId}`}
                          className={({ isActive }) =>
                            `sidebar__lesson-item${isActive ? ' sidebar__lesson-item--active' : ''}${done ? ' sidebar__lesson-item--done' : ''}${recommended ? ' sidebar__lesson-item--recommended' : ''}`
                          }
                        >
                          <span className="sidebar__lesson-status">{done ? '✓' : recommended ? '▶' : '○'}</span>
                          <span className="sidebar__lesson-id">{lesson.id}</span>
                          <span className="sidebar__lesson-title">{lesson.title}</span>
                          {!done && (
                            <span className="sidebar__lesson-xp">+{lesson.xp} XP</span>
                          )}
                          {recommended && <span className="sidebar__lesson-next-badge">next</span>}
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
