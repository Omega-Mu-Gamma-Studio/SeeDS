import { create } from 'zustand'

export const useCousinStore = create((set) => ({
  selectedCousin: 'default',
  unlockedCousins: ['default'],
  setCousin: (id) => set({ selectedCousin: id }),
  unlockCousin: (id) =>
    set((state) => ({
      unlockedCousins: state.unlockedCousins.includes(id)
        ? state.unlockedCousins
        : [...state.unlockedCousins, id],
    })),
}))
