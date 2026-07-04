export async function loadLesson(id) {
  const response = await fetch(`/src/data/lessons/${id}.json`)
  if (!response.ok) throw new Error(`Failed to load lesson ${id}`)
  return response.json()
}