import { create } from 'zustand'

export const useUIStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
