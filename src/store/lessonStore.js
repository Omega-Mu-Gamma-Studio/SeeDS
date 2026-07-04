import { create } from 'zustand'

export const useLessonStore = create((set) => ({
  currentLesson: null,
  currentPhase: 1,
  currentStep: 0,
  completed: false,
  setLesson: (id) => set({ currentLesson: id, currentPhase: 1, currentStep: 0 }),
  setPhase: (phase) => set({ currentPhase: phase }),
  nextPhase: () => set((state) => ({ currentPhase: state.currentPhase + 1 })),
  prevPhase: () => set((state) => ({ currentPhase: Math.max(1, state.currentPhase - 1) })),
}))
