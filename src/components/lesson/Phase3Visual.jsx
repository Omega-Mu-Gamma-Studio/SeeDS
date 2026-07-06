import { motion } from 'framer-motion'
import { useState } from 'react'
import CodeBlock from './CodeBlock.jsx'
import VisualizerDispatch from '../visualizers/VisualizerDispatch.jsx'

/**
 * Two-column layout: code (left) <-> visual (right). Hovering a mapped code
 * line highlights the corresponding node in the Konva canvas (PRD §4 phase
 * detail notes — this is the riskiest surface in the app).
 */
export default function Phase3Visual({ phase }) {
  const [hoveredLine, setHoveredLine] = useState(null)
  if (!phase) return null

  const mappingKey = hoveredLine ? `line${hoveredLine}` : null
  const mappedNodeId = mappingKey ? phase.mapping?.[mappingKey] : null

  return (
    <motion.div
      className="phase-content phase-content--visual"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
    >
      <h3>See the Visual</h3>
      <div className="phase-content__two-col">
        <div className="phase-content__col">
          <CodeBlock code={phase.code} onLineHover={setHoveredLine} hoveredLine={hoveredLine} />
        </div>
        <div className="phase-content__col phase-content__col--visual">
          <VisualizerDispatch visual={phase.visual} mappingHighlight={mappedNodeId} />
        </div>
      </div>
    </motion.div>
  )
}
