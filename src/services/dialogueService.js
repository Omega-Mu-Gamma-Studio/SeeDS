// Dialogue resolution per PRD §5.3 (fallback chain):
//   1. dialogue/{characterId}/{lessonId}.json -> phase.mascotDialogue, if it exists
//   2. lessons/{lessonId}.json                -> phase.mascotDialogue (neutral default)
//
// v1 ships with only the neutral default voice fully authored (PRD §5.1), so
// step 1 will almost always miss today — that's expected, not a bug. Adding a
// cousin's full pack later is purely a matter of dropping JSON files under
// data/dialogue/{cousin}/, no code changes required.

const dialogueModules = import.meta.glob('../data/dialogue/*/*.json', { eager: true })

function unwrap(mod) {
  return mod.default ?? mod
}

// Keyed as `${characterId}:${lessonId}`
const voicedOverrides = {}
Object.entries(dialogueModules).forEach(([path, mod]) => {
  const match = path.match(/dialogue\/([^/]+)\/([^/]+)\.json$/)
  if (!match) return
  const [, characterId, lessonId] = match
  voicedOverrides[`${characterId}:${lessonId}`] = unwrap(mod)
})

export const dialogueService = {
  /**
   * Resolve the mascotDialogue string for a given lesson + phase + character,
   * falling back to the neutral default baked into the lesson JSON itself.
   */
  resolvePhaseDialogue(lesson, phaseNumber, characterId) {
    const key = `${characterId}:${lesson.id}`
    const override = voicedOverrides[key]
    const overrideDialogue = override?.phases?.[phaseNumber]?.mascotDialogue
    if (overrideDialogue) return overrideDialogue
    return lesson.phases?.[phaseNumber]?.mascotDialogue || ''
  },

  hasVoicePack(characterId, lessonId) {
    return Boolean(voicedOverrides[`${characterId}:${lessonId}`])
  },
}
