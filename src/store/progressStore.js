import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProgressStore = create(
  persist(
    (set) => ({
      completedLessons: [],
      totalXP: 0,
      level: 1,
      streak: 0,
      completeLesson: (id, xp) =>
        set((state) => ({
          completedLessons: [...state.completedLessons, id],
          totalXP: state.totalXP + xp,
          level: Math.floor((state.totalXP + xp) / 100) + 1,
        })),
    }),
    { name: 'seeds-progress' }
  )
)