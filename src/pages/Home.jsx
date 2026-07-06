import { useNavigate } from 'react-router-dom'
import { useCousin } from '../hooks/useCousin.js'
import { useProgress } from '../hooks/useProgress.js'
import { lessonService } from '../services/lessonService.js'
import CousinAvatar from '../components/cousin/CousinAvatar.jsx'
import SpeechBubble from '../components/cousin/SpeechBubble.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { currentCousin } = useCousin()
  const { completedLessons, levelInfo } = useProgress()

  const allLessons = lessonService.getAllLessons()
  const nextLesson = allLessons.find((l) => !completedLessons.includes(l.id)) || allLessons[0]
  const percentDone = Math.round((completedLessons.length / allLessons.length) * 100)
  const currentLandmark = nextLesson ? lessonService.getLandmarkForLesson(nextLesson.id) : null

  return (
    <div className="home-page">
      {currentLandmark && (
        <div className="home-page__chapter">
          <span className="home-page__chapter-label">You are here</span>
          <span className="home-page__chapter-name">
            Unit {nextLesson.unit} — {currentLandmark.name}
          </span>
        </div>
      )}
      <div className="home-page__hero">
        <CousinAvatar cousin={currentCousin} expression="teaching" size="lg" />
        <div className="home-page__hero-text">
          <SpeechBubble
            text={
              completedLessons.length === 0
                ? `Welcome to the Academy! Ready to start with ${nextLesson?.title}?`
                : `Welcome back! Let's pick up right where you left off: ${nextLesson?.title}.`
            }
            catchphrase={currentCousin.catchphrase}
            showCatchphrase
          />
        </div>
      </div>

      <div className="home-page__cards">
        <div className="home-page__card">
          <h3>Continue Learning</h3>
          {nextLesson ? (
            <>
              <p className="home-page__lesson-title">{nextLesson.id} — {nextLesson.title}</p>
              <button className="home-page__cta" onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
                Continue →
              </button>
            </>
          ) : (
            <p>You've completed every lesson! 🎉</p>
          )}
        </div>

        <div className="home-page__card">
          <h3>Overall Progress</h3>
          <ProgressBar percent={percentDone} label={`${completedLessons.length} / ${allLessons.length} lessons complete`} />
          <p className="home-page__level">Level {levelInfo.level}</p>
        </div>

        <div className="home-page__card">
          <h3>Explore the Campus</h3>
          <p>Walk the island, find the CS block, pick a door.</p>
          <button className="home-page__cta home-page__cta--secondary" onClick={() => navigate('/island')}>
            Head to the Island →
          </button>
        </div>
      </div>
    </div>
  )
}
