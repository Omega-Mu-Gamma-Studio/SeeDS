import CousinPicker from '../components/cousin/CousinPicker.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import { useProgressStore } from '../store/progressStore.js'
import './Settings.css'

export default function Settings() {
  const resetProgress = useProgressStore((s) => s.resetProgress)

  function handleReset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      resetProgress()
    }
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-page__section">
        <h2>Appearance</h2>
        <ThemeToggle />
      </section>

      <section className="settings-page__section">
        <h2>Advisor</h2>
        <p className="settings-page__hint">
          Switching your advisor only changes who's talking -- your progress is
          never affected.
        </p>
        <CousinPicker context="settings" />
      </section>

      <section className="settings-page__section">
        <h2>Danger Zone</h2>
        <button className="settings-page__reset-btn" onClick={handleReset}>
          Reset all progress
        </button>
      </section>
    </div>
  )
}
