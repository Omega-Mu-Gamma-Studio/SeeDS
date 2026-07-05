import './CousinAvatar.css'

const EXPRESSIONS = ['teaching', 'excited', 'thinking', 'oops', 'frustrated', 'idle']

const EXPRESSION_GLYPH = {
  teaching: '🧑‍🏫',
  excited: '✨',
  thinking: '🤔',
  oops: '😅',
  frustrated: '😤',
  idle: '💤',
}

/**
 * Renders the current advisor. Two modes, chosen automatically per cousin:
 *
 *  - PORTRAIT (cousin.portrait set): a full illustrated ink-wash scene, not
 *    a clean sprite -- these carry real atmosphere (props, setting, mood)
 *    that a small circular crop would destroy. So the frame is a soft
 *    rounded-rect, not a circle, and sizes are taller than they are wide to
 *    respect the source composition instead of fighting it.
 *  - FALLBACK (no portrait yet): the original initial + expression-glyph
 *    badge, still circular, still functional -- this is what every cousin
 *    without commissioned art continues to render as, so the picker grid
 *    doesn't look broken mid-rollout.
 *
 * The expression glyph is layered on as a small corner chip in both modes,
 * rather than being baked into the art -- we are not commissioning a
 * separate illustration per mood, so mood is a UI overlay, not the source
 * image.
 */
export default function CousinAvatar({ cousin, expression = 'teaching', size = 'md' }) {
  if (!cousin) return null
  const glyph = EXPRESSION_GLYPH[expression] || EXPRESSION_GLYPH.teaching
  const initial = cousin.name?.[0] || '?'
  const hasPortrait = Boolean(cousin.portrait)

  if (hasPortrait) {
    return (
      <div
        className={`cousin-avatar cousin-avatar--portrait cousin-avatar--${size}`}
        title={`${cousin.name} — ${expression}`}
      >
        <div className="cousin-avatar__frame">
          <img
            className="cousin-avatar__portrait-img"
            src={cousin.portrait}
            alt={cousin.name}
            loading="lazy"
          />
          <span className="cousin-avatar__portrait-glyph">{glyph}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`cousin-avatar cousin-avatar--${size}`} title={`${cousin.name} — ${expression}`}>
      <div className="cousin-avatar__glow" />
      <div className="cousin-avatar__badge">
        <span className="cousin-avatar__initial">{initial}</span>
        <span className="cousin-avatar__glyph">{glyph}</span>
      </div>
    </div>
  )
}

export { EXPRESSIONS }
