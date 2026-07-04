import { create } from 'zustand'

function detectSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  }
  return 'day'
}

function loadStoredTheme() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('seeds:theme')
}

const initialTheme = loadStoredTheme() || detectSystemTheme()

export const useUIStore = create((set) => ({
  theme: initialTheme, // 'day' | 'night'
  sidebarOpen: true,
  mascotExpression: 'teaching', // teaching | excited | thinking | oops | frustrated | idle

  toggleTheme: () => set((state) => {
    const next = state.theme === 'day' ? 'night' : 'day'
    if (typeof window !== 'undefined') window.localStorage.setItem('seeds:theme', next)
    return { theme: next }
  }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('seeds:theme', theme)
    set({ theme })
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setMascotExpression: (expression) => set({ mascotExpression: expression }),
}))
