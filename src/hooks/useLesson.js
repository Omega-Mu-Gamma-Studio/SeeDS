import { useMemo } from 'react'
import { useLessonStore } from '../store/lessonStore.js'
import { lessonService } from '../services/lessonService.js'

export function useLesson(lessonIdOverride) {
  const { currentLesson, currentPhase, currentStep, setLesson, setPhase, nextPhase, prevPhase } = useLessonStore()
  const lessonId = lessonIdOverride ?? currentLesson

  const lesson = useMemo(() => (lessonId ? lessonService.getLesson(lessonId) : null), [lessonId])
  const landmark = useMemo(() => (lessonId ? lessonService.getLandmarkForLesson(lessonId) : null), [lessonId])
  const nextLesson = useMemo(() => (lessonId ? lessonService.getNextLesson(lessonId) : null), [lessonId])

  return {
    lesson, landmark, nextLesson,
    currentPhase, currentStep,
    setLesson, setPhase, nextPhase, prevPhase,
  }
}
