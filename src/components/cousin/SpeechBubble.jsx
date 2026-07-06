import { motion, AnimatePresence } from 'framer-motion'
import './SpeechBubble.css'

export default function SpeechBubble({ text, catchphrase, showCatchphrase = false }) {
  return (
    <div className="speech-bubble">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          className="speech-bubble__text"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
      {showCatchphrase && catchphrase && (
        <p className="speech-bubble__catchphrase">{catchphrase}</p>
      )}
      <div className="speech-bubble__tail" />
    </div>
  )
}
