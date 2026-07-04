import { create } from 'zustand'

const STORAGE_KEY = 'seeds:progress'

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
  completedLessons: [],
  totalXP: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  stamps: {}, // { [landmarkId]: { lessonsDone: [...], sealed: bool } }
  newStampsSinceOpen: 0,
}

const persisted = loadPersisted()
const initial = { ...defaults, ...(persisted || {}) }

function xpToLevel(xp) {
  // Simple curve: 100xp per level
  return Math.max(1, Math.floor(xp / 100) + 1)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export const useProgressStore = create((set, get) => ({
  ...initial,

  isLessonComplete: (lessonId) => get().completedLessons.includes(lessonId),

  completeLesson: (lessonId, xpAward, landmarkId, allLessonsForLandmark) => {
    const state = get()
    if (state.completedLessons.includes(lessonId)) return

    const completedLessons = [...state.completedLessons, lessonId]
    const totalXP = state.totalXP + xpAward
    const level = xpToLevel(totalXP)

    // streak bookkeeping
    const today = todayStr()
    let streak = state.streak
    if (state.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1
    }

    // stamp bookkeeping
    const stamps = { ...state.stamps }
    let newStamps = state.newStampsSinceOpen + 1 // lesson stamp
    if (landmarkId) {
      const prevEntry = stamps[landmarkId] || { lessonsDone: [], sealed: false }
      const lessonsDone = prevEntry.lessonsDone.includes(lessonId)
        ? prevEntry.lessonsDone
        : [...prevEntry.lessonsDone, lessonId]
      const sealed = Array.isArray(allLessonsForLandmark) && allLessonsForLandmark.length > 0
        ? allLessonsForLandmark.every((id) => lessonsDone.includes(id))
        : prevEntry.sealed
      if (sealed && !prevEntry.sealed) newStamps += 1 // wax-seal crest bonus
      stamps[landmarkId] = { lessonsDone, sealed }
    }

    const next = {
      completedLessons, totalXP, level, streak,
      lastActiveDate: today, stamps, newStampsSinceOpen: newStamps,
    }
    persist({ ...state, ...next })
    set(next)
  },

  clearNewStamps: () => set((state) => {
    persist({ ...state, newStampsSinceOpen: 0 })
    return { newStampsSinceOpen: 0 }
  }),

  resetProgress: () => {
    persist(defaults)
    set(defaults)
  },
}))
