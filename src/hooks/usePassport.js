import { useUIStore } from '../store/uiStore.js'
import { useProgressStore } from '../store/progressStore.js'

/**
 * Centralizes "open the passport" so it behaves identically no matter what
 * triggers it -- the FAB in AppLayout, or a hotspot inside a campus scene
 * (e.g. the Dorm's desk/journal). Opening always clears the new-stamp badge.
 */
export function usePassport() {
  const passportOpen = useUIStore((s) => s.passportOpen)
  const setPassportOpen = useUIStore((s) => s.setPassportOpen)
  const clearNewStamps = useProgressStore((s) => s.clearNewStamps)

  function openPassport() {
    setPassportOpen(true)
    clearNewStamps()
  }

  function closePassport() {
    setPassportOpen(false)
  }

  return { passportOpen, openPassport, closePassport }
}
