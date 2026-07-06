import { motion } from 'framer-motion'
import { useState } from 'react'
import CodeBlock from './CodeBlock.jsx'

export default function Phase2Code({ phase }) {
  const [hoveredLine, setHoveredLine] = useState(null)
  if (!phase) return null
  return (
    <motion.div
      className="phase-content phase-content--code"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
    >
      <h3>See the Code</h3>
      <CodeBlock
        code={phase.code}
        highlightLines={phase.highlightLines}
        onLineHover={setHoveredLine}
        hoveredLine={hoveredLine}
      />
    </motion.div>
  )
}
