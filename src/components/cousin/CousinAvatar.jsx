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
 * Renders the current advisor's sprite. Real per-cousin PNG sprites live at
 * cousin.spriteFolder/{expression}.png — until those assets exist, this falls
 * back to an initial + glyph badge so the UI is fully functional without art.
 */
export default function CousinAvatar({ cousin, expression = 'teaching', size = 'md' }) {
  if (!cousin) return null
  const glyph = EXPRESSION_GLYPH[expression] || EXPRESSION_GLYPH.teaching
  const initial = cousin.name?.[0] || '?'

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
