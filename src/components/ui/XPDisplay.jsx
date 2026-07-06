import { useProgress } from '../../hooks/useProgress.js'
import ProgressBar from './ProgressBar.jsx'
import './XPDisplay.css'

export default function XPDisplay() {
  const { totalXP, streak, levelInfo } = useProgress()

  return (
    <div className="xp-display">
      <div className="xp-display__level">Lvl {levelInfo.level}</div>
      <div className="xp-display__bar">
        <ProgressBar percent={levelInfo.percent} label={`${totalXP} XP total`} />
      </div>
      <div className="xp-display__streak" title="Day streak">🔥 {streak}</div>
    </div>
  )
}
