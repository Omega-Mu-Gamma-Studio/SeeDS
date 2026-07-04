import './ProgressBar.css'

export default function ProgressBar({ percent = 0, label }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      {label && <span className="progress-bar__label">{label}</span>}
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
