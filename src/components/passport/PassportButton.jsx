import { useProgress } from '../../hooks/useProgress.js'
import './Passport.css'

export default function PassportButton({ onClick }) {
  const { newStampsSinceOpen } = useProgress()
  return (
    <button className="passport-fab" onClick={onClick} aria-label="Open passport">
      🛂
      {newStampsSinceOpen > 0 && <span className="passport-fab__badge">{newStampsSinceOpen}</span>}
    </button>
  )
}
