// Loads Story Mode content (locations + NPCs). Same import.meta.glob eager
// pattern lessonService.js and useCousin.js already use for units/lessons/
// cousins -- adding a new location or NPC is purely a JSON-authoring task,
// no code changes (Story_Mode.md §6 / PRD §15).

const locationModules = import.meta.glob('../data/locations/*.json', { eager: true })
const npcModules = import.meta.glob('../data/npcs/*.json', { eager: true })

function unwrap(mod) {
  return mod.default ?? mod
}

const locationsById = {}
Object.values(locationModules).forEach((mod) => {
  const data = unwrap(mod)
  locationsById[data.id] = data
})

const npcsById = {}
Object.values(npcModules).forEach((mod) => {
  const data = unwrap(mod)
  npcsById[data.id] = data
})

export const storyService = {
  getAllLocations() {
    return Object.values(locationsById)
  },
  getLocation(id) {
    return locationsById[id] || null
  },
  getNpc(id) {
    return id ? npcsById[id] || null : null
  },
  getAllNpcs() {
    return Object.values(npcsById)
  },
  // A location's own hotspot is never gated -- Story_Mode.md §1 is explicit
  // that these are optional, un-quest-gated hotspots. This returns the
  // *lowest* unlocksAtUnit across a location's beats, which is 0 for every
  // location currently authored, so every hotspot is reachable from the
  // start. Written generically (rather than hardcoded "always true") so a
  // future location that intentionally wants a delayed reveal just needs
  // its first beat's unlocksAtUnit raised -- no code change.
  minUnlockUnit(location) {
    if (!location?.beats?.length) return 0
    return Math.min(...location.beats.map((b) => b.unlocksAtUnit ?? 0))
  },
  // Beats unlocked for a given amount of units-completed progress, in
  // authored order. The one exception is a beat flagged
  // `requiresAllLighthouses` (the Harbor Light "Triangle" payoff) -- that
  // one also needs the matching Unit-6 beat at North Light and South Light
  // already seen, per Story_Mode.md §4.7.
  unlockedBeats(location, unitsCompleted, seenBeatIds = []) {
    if (!location?.beats) return []
    return location.beats.filter((b) => {
      if ((b.unlocksAtUnit ?? 0) > unitsCompleted) return false
      if (b.requiresAllLighthouses) {
        return seenBeatIds.includes('north-light-03') && seenBeatIds.includes('south-light-03')
      }
      return true
    })
  },
}
