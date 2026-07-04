import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UnitPage from './pages/UnitPage'
import LessonPage from './pages/LessonPage'
import Settings from './pages/Settings'
import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unit/:unitId" element={<UnitPage />} />
          <Route path="/unit/:unitId/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App