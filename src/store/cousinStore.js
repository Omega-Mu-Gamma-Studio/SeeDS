import { create } from 'zustand'

const STORAGE_KEY = 'seeds:cousin'

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

const persisted = loadPersisted()

export const useCousinStore = create((set) => ({
  selectedCousin: persisted?.selectedCousin ?? 'default',
  hasSelectedAdvisor: persisted?.hasSelectedAdvisor ?? false,
  unlockedCousins: persisted?.unlockedCousins ?? [
    'default', 'scout', 'mei', 'camille', 'rosa', 'valeria',
    'ananya', 'miyu', 'florence', 'mack', 'simi',
  ],
  // Set by unlockCousin, cleared by the toast once shown. Not persisted --
  // it's a one-shot UI event, not durable state.
  pendingCelebration: null,

  // Set by setCousin on first-ever advisor pick, cleared by App once consumed
  // to route the very first landing to the Island instead of the Home
  // dashboard. Not persisted -- a one-shot UI event, same pattern as
  // pendingCelebration above, not durable state.
  justOnboarded: false,

  clearCelebration: () => set({ pendingCelebration: null }),
  clearJustOnboarded: () => set({ justOnboarded: false }),

  setCousin: (id) => set((state) => {
    const next = {
      selectedCousin: id,
      hasSelectedAdvisor: true,
      unlockedCousins: state.unlockedCousins,
    }
    persist(next)
    return { selectedCousin: id, hasSelectedAdvisor: true, justOnboarded: true }
  }),

  unlockCousin: (id) => set((state) => {
    const alreadyUnlocked = state.unlockedCousins.includes(id)
    const unlockedCousins = alreadyUnlocked
      ? state.unlockedCousins
      : [...state.unlockedCousins, id]
    persist({
      selectedCousin: state.selectedCousin,
      hasSelectedAdvisor: state.hasSelectedAdvisor,
      unlockedCousins,
    })
    return {
      unlockedCousins,
      pendingCelebration: alreadyUnlocked ? state.pendingCelebration : id,
    }
  }),
}))
