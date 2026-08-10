import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useCousinStore } from './store/cousinStore.js'
import AppLayout from './components/layout/AppLayout.jsx'
import CousinPicker from './components/cousin/CousinPicker.jsx'
import Home from './pages/Home.jsx'
import Island from './pages/Island.jsx'
import LocationScene from './pages/LocationScene.jsx'
import Campus from './pages/Campus.jsx'
import CSBlock from './pages/CSBlock.jsx'
import Dorm from './pages/Dorm.jsx'
import UnitPage from './pages/UnitPage.jsx'
import LessonPage from './pages/LessonPage.jsx'
import Settings from './pages/Settings.jsx'
import DrillHub from './pages/DrillHub.jsx'
import DrillPage from './pages/DrillPage.jsx'

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
  const justOnboarded = useCousinStore((s) => s.justOnboarded)

  if (!hasSelectedAdvisor) {
    return <OnboardingGate />
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Fresh advisor pick lands on the Island first, like starting a game.
              Island.jsx clears justOnboarded on mount, so every route after
              that (including a later reload of "/") goes to the normal Home
              dashboard -- this only fires once, right after onboarding. */}
          <Route
            path="/"
            element={justOnboarded ? <Navigate to="/island" replace /> : <Home />}
          />
          <Route path="/island" element={<Island />} />
          <Route path="/island/:locationId" element={<LocationScene />} />
          <Route path="/campus" element={<Campus />} />
          <Route path="/campus/cs" element={<CSBlock />} />
          <Route path="/campus/dorm" element={<Dorm />} />
          {/* Legacy flat map -- kept as an alias so old links/bookmarks still work. */}
          <Route path="/campus-map" element={<Navigate to="/campus" replace />} />
          <Route path="/campus-map/full" element={<UnitPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/drill" element={<DrillHub />} />
          <Route path="/drill/:drillId" element={<DrillPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
