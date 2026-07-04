import { useProgressStore } from '../store/progressStore.js'
import { xpProgressWithinLevel } from '../utils/xpCalculator.js'

export function useProgress() {
  const store = useProgressStore()
  const levelInfo = xpProgressWithinLevel(store.totalXP)

  return {
    ...store,
    levelInfo,
  }
}
