import { useCousinStore } from '../store/cousinStore.js'
import { dialogueService } from '../services/dialogueService.js'

export function useDialogue(lesson) {
  const selectedCousin = useCousinStore((s) => s.selectedCousin)

  function dialogueFor(phaseNumber) {
    if (!lesson) return ''
    return dialogueService.resolvePhaseDialogue(lesson, phaseNumber, selectedCousin)
  }

  return { dialogueFor }
}
