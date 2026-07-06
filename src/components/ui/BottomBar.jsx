import ThemeToggle from './ThemeToggle.jsx'
import XPDisplay from './XPDisplay.jsx'
import './BottomBar.css'

export default function BottomBar() {
  return (
    <footer className="bottom-bar">
      <XPDisplay />
      <ThemeToggle />
    </footer>
  )
}
