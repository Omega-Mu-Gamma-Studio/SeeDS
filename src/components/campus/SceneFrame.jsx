import { useNavigate } from 'react-router-dom'
import './SceneFrame.css'

/**
 * Shared chrome for every "explorable scene" on the campus map
 * (Island -> Campus -> CS Block -> Dorm). Each scene provides its own
 * background via the `art` prop (a CSS gradient placeholder until real
 * illustrations exist -- see art.js) and drops hotspots in as children,
 * positioned absolutely against the same viewBox-style coordinate space.
 *
 * Swapping a gradient for a real background-image later is a one-line
 * change in art.js, not a structural rewrite (same trick UnitPage already
 * used for the old flat campus-map).
 */
export default function SceneFrame({
  art,
  title,
  caption,
  backTo,
  backLabel = 'Back',
  children,
}) {
  const navigate = useNavigate()

  return (
    <div className="scene-frame">
      <div className="scene-frame__art" style={{ background: art }}>
        <div className="scene-frame__vignette" aria-hidden="true" />

        {backTo && (
          <button
            className="scene-frame__back"
            onClick={() => navigate(backTo)}
            aria-label={backLabel}
          >
            ← {backLabel}
          </button>
        )}

        <div className="scene-frame__heading">
          <h1>{title}</h1>
          {caption && <p>{caption}</p>}
        </div>

        <div className="scene-frame__hotspots">
          {children}
        </div>
      </div>
    </div>
  )
}
