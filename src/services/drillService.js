// Loads all drill JSON files. Mirrors lessonService.js — adding a new drill
// file to src/data/drills/ is purely a JSON-authoring task; no code changes needed.

const drillModules = import.meta.glob('../data/drills/*/*.json', { eager: true })

function unwrap(mod) {
  return mod.default ?? mod
}

const drillsById = {}
const drillsByUnit = {} // { '1': [...], '2': [...] }

Object.entries(drillModules).forEach(([path, mod]) => {
  const data = unwrap(mod)
  drillsById[data.id] = data

  // Infer unit number from path: drills/unit1/... → 1
  const match = path.match(/drills\/unit(\d+)\//)
  if (match) {
    const unit = match[1]
    if (!drillsByUnit[unit]) drillsByUnit[unit] = []
    drillsByUnit[unit].push(data)
  }
})

export const drillService = {
  getAllDrills() {
    return Object.values(drillsById)
  },

  getDrill(drillId) {
    return drillsById[drillId] || null
  },

  getDrillsForUnit(unitNumber) {
    return drillsByUnit[String(unitNumber)] || []
  },

  getAvailableUnits() {
    return Object.keys(drillsByUnit).map(Number).sort((a, b) => a - b)
  },

  // Returns all operationIds for a given drill (used by drillStore to check boss unlock).
  getOperationIds(drillId) {
    const drill = drillsById[drillId]
    if (!drill) return []
    return drill.operations.map((op) => op.id)
  },

  // Get a specific operation from a drill.
  getOperation(drillId, operationId) {
    const drill = drillsById[drillId]
    if (!drill) return null
    return drill.operations.find((op) => op.id === operationId) || null
  },
}
