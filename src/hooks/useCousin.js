import { useMemo } from 'react'
import { useCousinStore } from '../store/cousinStore.js'

const cousinModules = import.meta.glob('../data/cousins/*.json', { eager: true })
const cousinsById = {}
Object.values(cousinModules).forEach((mod) => {
  const data = mod.default ?? mod
  cousinsById[data.id] = data
})

export function useCousin() {
  const { selectedCousin, hasSelectedAdvisor, unlockedCousins, setCousin } = useCousinStore()

  const currentCousin = useMemo(
    () => cousinsById[selectedCousin] || cousinsById.default,
    [selectedCousin]
  )

  const allCousins = useMemo(
    () => Object.values(cousinsById).filter((c) => c.id !== 'default'),
    []
  )

  return {
    currentCousin,
    selectedCousin,
    hasSelectedAdvisor,
    unlockedCousins,
    allCousins,
    setCousin,
  }
}
