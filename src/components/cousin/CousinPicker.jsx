import { useCousin } from '../../hooks/useCousin.js'
import CousinAvatar from './CousinAvatar.jsx'
import './CousinPicker.css'

/**
 * Two contexts, one component (Master Doc §5.1):
 *  - "onboarding": full-screen, blocking, no pre-selection required to render,
 *    confirm button disabled until a cousin is tapped.
 *  - "settings": smaller/embedded grid, current selection pre-highlighted,
 *    changeable anytime, no confirm step (selection applies immediately).
 */
export default function CousinPicker({ context = 'settings', onConfirm }) {
  const { allCousins, selectedCousin, setCousin } = useCousin()

  const isOnboarding = context === 'onboarding'

  function handlePick(id) {
    setCousin(id)
    if (!isOnboarding && onConfirm) onConfirm(id)
  }

  return (
    <div className={`cousin-picker cousin-picker--${context}`}>
      {isOnboarding && (
        <p className="cousin-picker__framing">
          Every professor here teaches the exact same material.
          Pick whoever makes you want to show up to class.
        </p>
      )}
      <div className="cousin-picker__grid">
        {allCousins.map((cousin) => {
          const active = selectedCousin === cousin.id
          return (
            <button
              key={cousin.id}
              type="button"
              className={`cousin-picker__card${active ? ' cousin-picker__card--active' : ''}`}
              style={{ '--card-accent': cousin.palette.primary }}
              onClick={() => handlePick(cousin.id)}
            >
              <CousinAvatar cousin={cousin} size={isOnboarding ? 'md' : 'sm'} />
              <span className="cousin-picker__name">{cousin.name}</span>
              <span className="cousin-picker__origin">{cousin.origin}</span>
            </button>
          )
        })}
      </div>
      {isOnboarding && (
        <button
          type="button"
          className="cousin-picker__confirm"
          disabled={!selectedCousin}
          onClick={() => onConfirm && onConfirm(selectedCousin)}
        >
          Confirm my advisor
        </button>
      )}
    </div>
  )
}
