import { useState } from 'react'
import './Hotspot.css'

/**
 * One clickable (or locked) region in a scene, sized and positioned to hug
 * an actual object in the illustrated background -- a door, a desk, a
 * building -- rather than floating a badge on top of the art.
 *
 * `x`/`y`/`width`/`height` are all percentages of the scene, describing a
 * bounding box over the real object (x/y = top-left corner, not center).
 * The region is fully invisible at rest; hovering or focusing it reveals a
 * soft outline traced to that same box plus a label, so the art reads clean
 * until someone's actually looking for what's interactive.
 */
export default function Hotspot({
  x,
  y,
  width,
  height,
  label,
  sublabel,
  locked = false,
  current = false,
  lockedReason = 'Locked for now',
  onClick,
}) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused

  return (
    <div
      className="hotspot"
      style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }}
    >
      <button
        type="button"
        className={[
          'hotspot__region',
          locked ? 'hotspot__region--locked' : '',
          current ? 'hotspot__region--current' : '',
          active ? 'hotspot__region--active' : '',
        ].join(' ').trim()}
        disabled={locked}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={locked ? `${label} (${lockedReason})` : label}
      >
        {current && <span className="hotspot__pulse" aria-hidden="true" />}
      </button>

      {active && (
        <div className="hotspot__tooltip" role="tooltip">
          <span className="hotspot__tooltip-title">{label}</span>
          {(locked ? lockedReason : sublabel) && (
            <span className="hotspot__tooltip-sub">{locked ? lockedReason : sublabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
