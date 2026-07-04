import './PhaseIndicator.css'

const PHASE_NAMES = ['Understand', 'See the Code', 'See the Visual', 'See the Break', 'Test']

export default function PhaseIndicator({ currentPhase, completedPhases = [], onSelectPhase }) {
  return (
    <div className="phase-indicator">
      {PHASE_NAMES.map((name, i) => {
        const phaseNum = i + 1
        const isActive = phaseNum === currentPhase
        const isDone = completedPhases.includes(phaseNum) || phaseNum < currentPhase
        return (
          <button
            key={phaseNum}
            type="button"
            className={`phase-indicator__stub${isActive ? ' phase-indicator__stub--active' : ''}${isDone ? ' phase-indicator__stub--done' : ''}`}
            onClick={() => onSelectPhase && onSelectPhase(phaseNum)}
          >
            <span className="phase-indicator__num">{phaseNum}</span>
            <span className="phase-indicator__name">{name}</span>
          </button>
        )
      })}
    </div>
  )
}
