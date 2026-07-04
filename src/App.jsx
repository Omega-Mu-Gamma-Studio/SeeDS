import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useCousinStore } from './store/cousinStore.js'
import AppLayout from './components/layout/AppLayout.jsx'
import CousinPicker from './components/cousin/CousinPicker.jsx'
import Home from './pages/Home.jsx'
import UnitPage from './pages/UnitPage.jsx'
import LessonPage from './pages/LessonPage.jsx'
import Settings from './pages/Settings.jsx'

function OnboardingGate() {
  const setCousin = useCousinStore((s) => s.setCousin)

  return (
    <div className="onboarding-gate">
      <CousinPicker context="onboarding" onConfirm={(id) => setCousin(id)} />
    </div>
  )
}

function App() {
  const hasSelectedAdvisor = useCousinStore((s) => s.hasSelectedAdvisor)

  if (!hasSelectedAdvisor) {
    return <OnboardingGate />
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campus-map" element={<UnitPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
