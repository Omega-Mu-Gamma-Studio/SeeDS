import { useUIStore } from '../../store/uiStore.js'
import { useCousin } from '../../hooks/useCousin.js'
import { usePassport } from '../../hooks/usePassport.js'
import Sidebar from './Sidebar.jsx'
import AnimatedBg from './AnimatedBg.jsx'
import BottomBar from '../ui/BottomBar.jsx'
import PassportButton from '../passport/PassportButton.jsx'
import PassportPanel from '../passport/PassportPanel.jsx'
import CousinUnlockToast from '../cousin/CousinUnlockToast.jsx'
import LandmarkSealToast from '../passport/LandmarkSealToast.jsx'
import './AppLayout.css'

export default function AppLayout({ children }) {
  const theme = useUIStore((s) => s.theme)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const { selectedCousin } = useCousin()
  const { passportOpen, openPassport, closePassport } = usePassport()

  return (
    <div
      className="app-layout"
      data-theme={theme === 'night' ? 'night' : undefined}
      data-cousin={selectedCousin}
    >
      <AnimatedBg />
      <CousinUnlockToast />
      <LandmarkSealToast />
      <div className="app-layout__body">
        <Sidebar open={sidebarOpen} />
        <main className="app-layout__main">
          {children}
        </main>
      </div>
      <BottomBar />
      <PassportButton onClick={openPassport} />
      {/* Remounting on open resets PassportPanel to its front page (Student
          Record) every time it's freshly opened, rather than reopening
          mid-book from wherever it was last left. */}
      <PassportPanel key={passportOpen} open={passportOpen} onClose={closePassport} />
    </div>
  )
}
