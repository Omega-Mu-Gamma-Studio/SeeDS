// Thin wrapper around localStorage. Per PRD §10 — no other module should call
// window.localStorage directly, so the backing store can be swapped later
// (e.g. for a cloud account) without touching every consumer.

const PREFIX = 'seeds:'

export const storageService = {
  get(key, fallback = null) {
    if (typeof window === 'undefined') return fallback
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — fail silently, app still works in-memory
    }
  },
  remove(key) {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(PREFIX + key)
  },
}
