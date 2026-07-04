import { motion } from 'framer-motion'

export default function Phase1Understand({ phase }) {
  if (!phase) return null
  return (
    <motion.div
      className="phase-content phase-content--understand"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
    >
      <h3>Concept</h3>
      <p>{phase.concept}</p>
      <h3>Think of it like this</h3>
      <p className="phase-content__analogy">{phase.analogy}</p>
    </motion.div>
  )
}
