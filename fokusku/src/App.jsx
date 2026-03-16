import { useEffect } from 'react'
import { useStore } from './store'
import { T, Toast, BottomNav } from './components/ui'
import { TimerPage }  from './pages/Timer'
import { JournalPage } from './pages/Journal'
import { StatsPage }  from './pages/Stats'
import { AIPage }     from './pages/AI'

function Splash() {
  return (
    <div style={{ background:`linear-gradient(160deg,${T.cream} 0%,${T.bg} 100%)`, minHeight:'100vh', maxWidth:430, margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:80, height:80, background:`linear-gradient(135deg,${T.teal},${T.teal2})`, borderRadius:26, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, boxShadow:`0 12px 32px ${T.teal}44`, animation:'fadeIn 0.8s ease' }}>
        🎯
      </div>
      <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:34, color:T.ink, animation:'fadeIn 0.8s 0.2s ease both' }}>FokusKu</div>
      <div style={{ fontSize:13, color:T.muted, animation:'fadeIn 0.8s 0.4s ease both' }}>Deep Work · Jurnal · AI Coach</div>
      <div style={{ marginTop:24, animation:'fadeIn 0.8s 0.6s ease both' }}>
        <div style={{ width:32, height:32, border:`3px solid ${T.line}`, borderTopColor:T.teal, borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      </div>
    </div>
  )
}

export default function App() {
  const { page, navigate, toast } = useStore()

  const renderPage = () => {
    switch(page) {
      case 'timer':   return <TimerPage/>
      case 'journal': return <JournalPage/>
      case 'stats':   return <StatsPage/>
      case 'ai':      return <AIPage/>
      default:        return <TimerPage/>
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { background:${T.bg}; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:${T.line}; border-radius:2px; }
        input, textarea, button { font-family:'Plus Jakarta Sans',sans-serif; }
        input::placeholder, textarea::placeholder { color:${T.muted}; font-style:italic; }
        @keyframes spin      { to { transform:rotate(360deg) } }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{transform:translateX(-50%) translateY(-20px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div style={{ maxWidth:430, margin:'0 auto', position:'relative' }}>
        {renderPage()}
        <BottomNav page={page} navigate={navigate}/>
        <Toast toast={toast}/>
      </div>
    </>
  )
}
