import { useUIStore } from '../../store/uiStore.js'
import './AnimatedBg.css'

/**
 * Ambient backdrop layer. Day/night is a CSS treatment over one shared
 * backdrop (Master Doc §3.4) rather than two separately-authored looks.
 */
export default function AnimatedBg() {
  const theme = useUIStore((s) => s.theme)

  return (
    <div className={`animated-bg animated-bg--${theme}`} aria-hidden="true">
      <div className="animated-bg__gradient" />
      {theme === 'night' && (
        <div className="animated-bg__stars">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="animated-bg__star"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 53) % 100}%`,
                animationDelay: `${(i % 10) * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
