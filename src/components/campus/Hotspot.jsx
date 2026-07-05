import { useState } from 'react'
import './Hotspot.css'

/**
 * One clickable (or locked) thing in a scene: a department building on the
 * Campus overview, a lecture-hall door in the CS Block hallway, a desk in
 * the Dorm. Positioned with `x`/`y` percentages so it stays glued to the
 * right spot regardless of viewport size (no drift like plain background-
 * image + absolute-px positioning would cause).
 *
 * variant="building" -> squarer card, used on the Campus overview
 * variant="door"      -> tall arched door, used in the CS Block hallway
 */
export default function Hotspot({
  x,
  y,
  label,
  sublabel,
  icon = '🏛️',
  variant = 'building',
  locked = false,
  current = false,
  lockedReason = 'Locked for now',
  onClick,
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="hotspot"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={[
          'hotspot__shape',
          `hotspot__shape--${variant}`,
          locked ? 'hotspot__shape--locked' : '',
          current ? 'hotspot__shape--current' : '',
        ].join(' ').trim()}
        disabled={locked}
        onClick={onClick}
        aria-label={locked ? `${label} (${lockedReason})` : label}
      >
        <span className="hotspot__icon">{locked ? '🔒' : icon}</span>
        {current && <span className="hotspot__pulse" aria-hidden="true" />}
      </button>

      <div className="hotspot__label">
        <span className="hotspot__label-text">{label}</span>
        {sublabel && <span className="hotspot__label-sub">{sublabel}</span>}
      </div>

      {hovered && (
        <div className="hotspot__tooltip" role="tooltip">
          {locked ? lockedReason : sublabel || label}
        </div>
      )}
    </div>
  )
}
