import { useUIStore } from '../../store/uiStore.js'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle day/night theme">
      <span className="theme-toggle__icon">{theme === 'night' ? '🌙' : '☀️'}</span>
      <span className="theme-toggle__label">{theme === 'night' ? 'Night' : 'Day'}</span>
    </button>
  )
}
