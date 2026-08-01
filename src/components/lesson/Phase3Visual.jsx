import { motion } from 'framer-motion'
import { useState } from 'react'
import CodeBlock from './CodeBlock.jsx'
import VisualizerDispatch from '../visualizers/VisualizerDispatch.jsx'
import StepPlayer, { useStepPlayer } from './StepPlayer.jsx'

/**
 * Two-column layout: code (left) <-> visual (right). Hovering a mapped code
 * line highlights the corresponding node in the Konva canvas (PRD §4 phase
 * detail notes — this is the riskiest surface in the app).
 *
 * Only sorting-style lessons carry a `visual.data.steps` log (PRD §8.5 —
 * pointer-based structures use a single per-phase snapshot, not a scrubbable
 * step sequence), so the step player only mounts when one's present. When it
 * does, `stepIndex` is forwarded straight through to the renderer, which
 * owns interpreting what a given step actually looks like — Phase3Visual
 * itself stays renderer-agnostic.
 */
export default function Phase3Visual({ phase, lessonId }) {
  const [hoveredLine, setHoveredLine] = useState(null)
  const steps = phase?.visual?.data?.steps
  const stepPlayer = useStepPlayer(steps?.length ?? 1)
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
          <VisualizerDispatch
            visual={phase.visual}
            lessonId={lessonId}
            mappingHighlight={mappedNodeId}
            stepIndex={steps ? stepPlayer.index : undefined}
          />
          {steps && <StepPlayer {...stepPlayer} stepCount={steps.length} />}
        </div>
      </div>
    </motion.div>
  )
}
