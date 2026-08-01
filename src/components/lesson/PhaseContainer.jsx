import { AnimatePresence } from 'framer-motion'
import PhaseIndicator from './PhaseIndicator.jsx'
import Phase1Understand from './Phase1Understand.jsx'
import Phase2Code from './Phase2Code.jsx'
import Phase3Visual from './Phase3Visual.jsx'
import Phase4Break from './Phase4Break.jsx'
import Phase5Test from './Phase5Test.jsx'
import CousinAvatar from '../cousin/CousinAvatar.jsx'
import SpeechBubble from '../cousin/SpeechBubble.jsx'
import { useCousin } from '../../hooks/useCousin.js'
import { useDialogue } from '../../hooks/useDialogue.js'
import { useUIStore } from '../../store/uiStore.js'
import './PhaseContainer.css'

export default function PhaseContainer({ lesson, currentPhase, onSelectPhase, onNextPhase, onPrevPhase, onTestComplete }) {
  const { currentCousin } = useCousin()
  const { dialogueFor } = useDialogue(lesson)
  const mascotExpression = useUIStore((s) => s.mascotExpression)

  if (!lesson) return null

  const phaseData = lesson.phases[String(currentPhase)]
  const dialogue = dialogueFor(currentPhase)
  const hasPrev = currentPhase > 1

  return (
    <div className="phase-container">
      <PhaseIndicator currentPhase={currentPhase} onSelectPhase={onSelectPhase} />

      <div className={`phase-container__body${currentPhase === 4 ? ' phase-container__body--damaged' : ''}`}>
        <AnimatePresence mode="wait">
          <div key={currentPhase}>
            {currentPhase === 1 && <Phase1Understand phase={phaseData} />}
            {currentPhase === 2 && <Phase2Code phase={phaseData} />}
            {currentPhase === 3 && <Phase3Visual phase={phaseData} lessonId={lesson.id} />}
            {currentPhase === 4 && phaseData && <Phase4Break phase={phaseData} lessonId={lesson.id} />}
            {currentPhase === 5 && <Phase5Test phase={phaseData} onComplete={onTestComplete} />}
          </div>
        </AnimatePresence>
      </div>

      <div className="phase-container__mascot-row">
        <CousinAvatar cousin={currentCousin} expression={mascotExpression} size="md" />
        <SpeechBubble
          text={dialogue}
          catchphrase={currentCousin.catchphrase}
          showCatchphrase={currentPhase === 5}
        />
      </div>

      <div className="phase-container__nav">
        <button type="button" onClick={onPrevPhase} disabled={!hasPrev} className="phase-container__nav-btn">
          ◀ Previous
        </button>
        <button type="button" onClick={onNextPhase} disabled={currentPhase >= 5} className="phase-container__nav-btn phase-container__nav-btn--primary">
          Next ▶
        </button>
      </div>
    </div>
  )
}
