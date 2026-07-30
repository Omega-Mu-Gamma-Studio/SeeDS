import { create } from 'zustand'

const STORAGE_KEY = 'seeds:story'

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
  visitedLocations: [], // [locationId, ...] -- drives Field Badges, once-ever
  seenBeatIds: [], // [beatId, ...] -- drives the Journal, never re-locked
  npcLayerSeen: {}, // { [npcId]: highestLayerReached }
  npcChoices: {}, // { [npcId]: 'friendship' | 'romance' }
}
// One-shot UI events, cleared by their toast once shown -- same pattern as
// progressStore's pendingSeal, deliberately excluded from persist().
const transientDefaults = {
  pendingBadge: null, // locationId, or null
}
const persisted = loadPersisted()
const initial = { ...defaults, ...(persisted || {}) }

export const useStoryStore = create((set, get) => ({
  ...initial,
  ...transientDefaults,

  hasVisited: (locationId) => get().visitedLocations.includes(locationId),
  hasSeenBeat: (beatId) => get().seenBeatIds.includes(beatId),

  // Called on LocationScene mount. First-ever visit earns the Field Badge
  // (sets pendingBadge so FieldBadgeToast fires) and is the only thing that
  // ever adds to visitedLocations -- repeat visits are a no-op here.
  visitLocation: (locationId) => {
    const state = get()
    if (state.visitedLocations.includes(locationId)) return
    const visitedLocations = [...state.visitedLocations, locationId]
    const next = { ...state, visitedLocations, pendingBadge: locationId }
    persist({ ...defaults, visitedLocations, seenBeatIds: state.seenBeatIds, npcLayerSeen: state.npcLayerSeen, npcChoices: state.npcChoices })
    set({ visitedLocations, pendingBadge: locationId })
    return next
  },

  // Marks a beat seen, ever. Never re-locked or removed if a student
  // doesn't come back -- Story_Mode.md §1: "a thinner journal, not a
  // broken one." Safe to call for a beat already seen.
  markBeatSeen: (beatId) => {
    const state = get()
    if (state.seenBeatIds.includes(beatId)) return
    const seenBeatIds = [...state.seenBeatIds, beatId]
    persist({ ...defaults, visitedLocations: state.visitedLocations, seenBeatIds, npcLayerSeen: state.npcLayerSeen, npcChoices: state.npcChoices })
    set({ seenBeatIds })
  },

  // Advances (never rewinds) how far a student has gotten into an NPC's
  // dialogue layers. `maxLayer` is that NPC's own layer count, passed in by
  // the caller so this store stays data-agnostic.
  advanceNpcLayer: (npcId, maxLayer) => {
    const state = get()
    const current = state.npcLayerSeen[npcId] || 0
    if (current >= maxLayer) return current
    const nextLayer = current + 1
    const npcLayerSeen = { ...state.npcLayerSeen, [npcId]: nextLayer }
    persist({ ...defaults, visitedLocations: state.visitedLocations, seenBeatIds: state.seenBeatIds, npcLayerSeen, npcChoices: state.npcChoices })
    set({ npcLayerSeen })
    return nextLayer
  },

  // The Tiny Choice (Story_Mode.md §3.2). Set once; later calls for the
  // same NPC are ignored so a student can't flip their answer by replaying
  // the scene.
  setNpcChoice: (npcId, choice) => {
    const state = get()
    if (state.npcChoices[npcId]) return
    const npcChoices = { ...state.npcChoices, [npcId]: choice }
    persist({ ...defaults, visitedLocations: state.visitedLocations, seenBeatIds: state.seenBeatIds, npcLayerSeen: state.npcLayerSeen, npcChoices })
    set({ npcChoices })
  },

  clearBadgeCelebration: () => set({ pendingBadge: null }),

  resetStory: () => {
    persist(defaults)
    set({ ...defaults, ...transientDefaults })
  },
}))
