// Story Mode gates its journal beats on "units completed" (Story_Mode.md
// §1), which the app doesn't otherwise track as a single number -- only as
// a list of completed lesson ids. This derives it, counting contiguously
// from Unit 1 (matching how CSBlock.jsx already gates landmark access on
// the *previous* landmark being finished, so a unit here means "actually
// finished," not "has some progress").
export function unitsCompleted(units, completedLessons) {
  const sorted = [...units].sort((a, b) => a.unit - b.unit)
  let count = 0
  for (const unit of sorted) {
    const lessons = unit.lessons || []
    const done = lessons.length > 0 && lessons.every((id) => completedLessons.includes(id))
    if (!done) break
    count = unit.unit
  }
  return count
}
