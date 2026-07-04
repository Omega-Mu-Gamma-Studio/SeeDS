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

  setCousin: (id) => set((state) => {
    const next = {
      selectedCousin: id,
      hasSelectedAdvisor: true,
      unlockedCousins: state.unlockedCousins,
    }
    persist(next)
    return { selectedCousin: id, hasSelectedAdvisor: true }
  }),

  unlockCousin: (id) => set((state) => {
    const unlockedCousins = state.unlockedCousins.includes(id)
      ? state.unlockedCousins
      : [...state.unlockedCousins, id]
    persist({
      selectedCousin: state.selectedCousin,
      hasSelectedAdvisor: state.hasSelectedAdvisor,
      unlockedCousins,
    })
    return { unlockedCousins }
  }),
}))
