import { create } from 'zustand'

const STORAGE_KEY = 'seeds:drills'
const LOCKIN_THRESHOLD = 3 // clean reps needed to lock in an operation

function loadPersisted() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persist(data) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const defaults = {
  // attempts[drillId][operationId] = { count, cleanCount, bestTimeMs, lockedIn }
  attempts: {},
  // bossRoundUnlocked[drillId] = bool
  bossRoundUnlocked: {},
  // bossRoundComplete[drillId] = bool
  bossRoundComplete: {},
}

const persisted = loadPersisted()
const initial = { ...defaults, ...(persisted || {}) }

export const useDrillStore = create((set, get) => ({
  ...initial,

  // Record a drill attempt for a specific operation.
  // clean = true means the student got it right (no hints revealed, within time limit).
  recordAttempt(drillId, operationId, { clean, timeMs, allOperationIds }) {
    const state = get()
    const drillAttempts = state.attempts[drillId] || {}
    const prev = drillAttempts[operationId] || { count: 0, cleanCount: 0, bestTimeMs: null, lockedIn: false }

    const cleanCount = clean ? prev.cleanCount + 1 : prev.cleanCount
    const bestTimeMs = clean
      ? prev.bestTimeMs === null ? timeMs : Math.min(prev.bestTimeMs, timeMs)
      : prev.bestTimeMs
    const lockedIn = cleanCount >= LOCKIN_THRESHOLD

    const nextOpAttempts = { ...prev, count: prev.count + 1, cleanCount, bestTimeMs, lockedIn }
    const nextDrillAttempts = { ...drillAttempts, [operationId]: nextOpAttempts }

    // Check if all operations are now locked in → unlock Boss Round
    const bossRoundUnlocked = { ...state.bossRoundUnlocked }
    if (
      Array.isArray(allOperationIds) &&
      allOperationIds.length > 0 &&
      allOperationIds.every((opId) => {
        const op = opId === operationId ? nextOpAttempts : (nextDrillAttempts[opId] || {})
        return op.lockedIn
      })
    ) {
      bossRoundUnlocked[drillId] = true
    }

    const next = {
      attempts: { ...state.attempts, [drillId]: nextDrillAttempts },
      bossRoundUnlocked,
    }
    persist({ ...state, ...next })
    set(next)
  },

  completeBossRound(drillId) {
    const state = get()
    const next = {
      bossRoundComplete: { ...state.bossRoundComplete, [drillId]: true },
    }
    persist({ ...state, ...next })
    set(next)
  },

  getOperationStats(drillId, operationId) {
    const state = get()
    return state.attempts[drillId]?.[operationId] || { count: 0, cleanCount: 0, bestTimeMs: null, lockedIn: false }
  },

  getDrillStats(drillId) {
    const state = get()
    return state.attempts[drillId] || {}
  },

  isBossRoundUnlocked(drillId) {
    return get().bossRoundUnlocked[drillId] || false
  },

  isBossRoundComplete(drillId) {
    return get().bossRoundComplete[drillId] || false
  },

  resetDrill(drillId) {
    const state = get()
    const attempts = { ...state.attempts }
    delete attempts[drillId]
    const bossRoundUnlocked = { ...state.bossRoundUnlocked }
    delete bossRoundUnlocked[drillId]
    const bossRoundComplete = { ...state.bossRoundComplete }
    delete bossRoundComplete[drillId]
    const next = { attempts, bossRoundUnlocked, bossRoundComplete }
    persist({ ...state, ...next })
    set(next)
  },

  resetAll() {
    persist(defaults)
    set(defaults)
  },
}))
