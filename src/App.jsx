import { useEffect } from 'react'
import { useStore } from './store'
import { T, D, useTokens, Toast, BottomNav } from './components/ui'
import { OnboardingPage } from './pages/Onboarding'
import { TimerPage }      from './pages/Timer'
import { JournalPage }    from './pages/Journal'
import { StatsPage }      from './pages/Stats'
import { AIPage }         from './pages/AI'
import { SettingsPage }   from './pages/Settings'
import { registerSW, rescheduleAll } from './lib/notifications'

const MAIN_PAGES = ['timer','journal','stats','ai','settings']

export default function App() {
  const { page, navigate, toast, darkMode, onboardingDone,
          notifEnabled, morningHour, eveningHour, streak, lastActiveDate } = useStore()
  const C = useTokens(darkMode)

  // Register SW + reschedule on every app open
  useEffect(() => {
    registerSW()
    if (notifEnabled && onboardingDone) {
      rescheduleAll({ morningHour, eveningHour, streak, lastActiveDate }).catch(()=>{})
    }
  }, [])

  const showOnboarding = !onboardingDone && page === 'onboarding'

  const renderPage = () => {
    if (showOnboarding) return <OnboardingPage/>
    switch(page) {
      case 'timer':    return <TimerPage/>
      case 'journal':  return <JournalPage/>
      case 'stats':    return <StatsPage/>
      case 'ai':       return <AIPage/>
      case 'settings': return <SettingsPage/>
      default:         return <TimerPage/>
    }
  }

  const showNav = !showOnboarding && MAIN_PAGES.includes(page)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body {
          background:${darkMode ? D.bg : T.bg};
          -webkit-tap-highlight-color:transparent;
          transition:background 0.3s;
        }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:${C.line}; border-radius:2px; }
        input, textarea, button { font-family:'Plus Jakarta Sans',sans-serif; }
        input::placeholder, textarea::placeholder { color:${C.muted}; font-style:italic; }
        @keyframes spin       { to { transform:rotate(360deg) } }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown  { from{transform:translateX(-50%) translateY(-20px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div style={{ maxWidth:430, margin:'0 auto', position:'relative' }}>
        {renderPage()}
        {showNav && <BottomNav page={page} navigate={navigate} darkMode={darkMode}/>}
        <Toast toast={toast}/>
      </div>
    </>
  )
}
