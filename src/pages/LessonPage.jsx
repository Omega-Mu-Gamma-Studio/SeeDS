import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLesson } from '../hooks/useLesson.js'
import { useProgress } from '../hooks/useProgress.js'
import PhaseContainer from '../components/lesson/PhaseContainer.jsx'
import './LessonPage.css'

export default function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { lesson, landmark, nextLesson, currentPhase, setLesson, setPhase, nextPhase, prevPhase } = useLesson(lessonId)
  const { completeLesson } = useProgress()

  useEffect(() => {
    setLesson(lessonId)
    // setLesson is a stable Zustand action reference; only lessonId should
    // re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  if (!lesson) {
    return (
      <div className="lesson-page">
        <p>Lesson not found.</p>
      </div>
    )
  }

  function handleTestComplete(correct) {
    if (correct) {
      completeLesson(lesson.id, lesson.xp, landmark?.id, landmark?.lessons)
    }
  }

  function handleNextPhase() {
    if (currentPhase >= 5) {
      if (nextLesson) navigate(`/lesson/${nextLesson.id}`)
      else navigate('/campus-map')
    } else {
      nextPhase()
    }
  }

  return (
    <div className="lesson-page">
      <div className="lesson-page__header">
        <span className="lesson-page__breadcrumb">
          Unit {lesson.unit}{landmark ? ` · ${landmark.name}` : ''}
        </span>
        <h1>{lesson.id} — {lesson.title}</h1>
        <div className="lesson-page__topics">
          {lesson.topics.map((t) => <span key={t} className="lesson-page__topic-chip">{t}</span>)}
        </div>
      </div>

      <PhaseContainer
        lesson={lesson}
        currentPhase={currentPhase}
        onSelectPhase={setPhase}
        onNextPhase={handleNextPhase}
        onPrevPhase={prevPhase}
        onTestComplete={handleTestComplete}
      />
    </div>
  )
}
