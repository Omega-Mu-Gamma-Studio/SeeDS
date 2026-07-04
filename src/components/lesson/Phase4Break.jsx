import { motion } from 'framer-motion'
import CodeBlock from './CodeBlock.jsx'
import VisualizerDispatch from '../visualizers/VisualizerDispatch.jsx'

/**
 * "See the Break" gets a distinct damage treatment independent of advisor
 * color (Master Doc §6.3) — the glitch texture is purely visual chrome; the
 * broken diagram itself keeps --ds-broken red regardless of cousin.
 */
export default function Phase4Break({ phase }) {
  if (!phase) return null
  return (
    <motion.div
      className="phase-content phase-content--break"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
    >
      <h3>See the Break</h3>
      <p className="phase-content__bug-desc">{phase.bugDescription}</p>
      <div className="phase-content__two-col">
        <div className="phase-content__col">
          <CodeBlock code={phase.brokenCode} />
        </div>
        {phase.brokenVisual && (
          <div className="phase-content__col phase-content__col--visual">
            <VisualizerDispatch visual={phase.brokenVisual} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
