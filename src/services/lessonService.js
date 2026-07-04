// Loads lesson + unit JSON content. Vite's import.meta.glob eagerly bundles
// every JSON file under these folders at build time, so adding a new lesson
// is purely a JSON-authoring task (PRD §15 — "extensibility... no code changes").

const unitModules = import.meta.glob('../data/units/*.json', { eager: true })
const lessonModules = import.meta.glob('../data/lessons/*/*.json', { eager: true })

function unwrap(mod) {
  return mod.default ?? mod
}

const unitsById = {}
Object.values(unitModules).forEach((mod) => {
  const data = unwrap(mod)
  unitsById[data.unit] = data
})

const lessonsById = {}
Object.values(lessonModules).forEach((mod) => {
  const data = unwrap(mod)
  lessonsById[data.id] = data
})

export const lessonService = {
  getAllUnits() {
    return Object.values(unitsById).sort((a, b) => a.unit - b.unit)
  },
  getUnit(unitNumber) {
    return unitsById[unitNumber] || null
  },
  getLesson(lessonId) {
    return lessonsById[lessonId] || null
  },
  getAllLessons() {
    return Object.values(lessonsById).sort((a, b) => {
      const [au, al] = a.id.split('.').map(Number)
      const [bu, bl] = b.id.split('.').map(Number)
      return au - bu || al - bl
    })
  },
  getLandmarkForLesson(lessonId) {
    for (const unit of Object.values(unitsById)) {
      for (const landmark of unit.landmarks || []) {
        if (landmark.lessons.includes(lessonId)) return landmark
      }
    }
    return null
  },
  getNextLesson(lessonId) {
    const all = this.getAllLessons()
    const idx = all.findIndex((l) => l.id === lessonId)
    if (idx === -1 || idx === all.length - 1) return null
    return all[idx + 1]
  },
}
