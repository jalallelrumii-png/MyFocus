import { useState } from 'react'
import { useStore } from '../store'
import { T, fmt, Btn, Card, SectionLabel } from '../components/ui'

export function TimerPage() {
  const {
    mode, setMode,
    timerRunning, secondsLeft, totalSeconds,
    currentTask, setCurrentTask,
    sessionCount, totalFocusMinutes, streak,
    sessions, startTimer, pauseTimer, stopTimer,
    deepWorkMinutes, setDeepWorkMinutes,
    navigate,
  } = useStore()

  const [showDWPicker, setShowDWPicker] = useState(false)

  const pct     = totalSeconds > 0 ? (1 - secondsLeft / totalSeconds) : 0
  const r       = 88
  const circ    = 2 * Math.PI * r
  const offset  = circ * (1 - pct)

  const ringColor  = mode === 'break' ? T.amber : T.teal
  const ringColor2 = mode === 'break' ? T.amber2 : T.teal2

  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Selamat Pagi ☀️' : hour < 15 ? 'Selamat Siang 🌤' : hour < 18 ? 'Selamat Sore 🌅' : 'Selamat Malam 🌙'

  const modeLabel = { pomodoro:'Pomodoro · 25 menit', deepwork:`Deep Work · ${deepWorkMinutes} menit`, break:'Istirahat · 5 menit' }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:T.bg, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:90 }}>

      {/* ── Header ── */}
      <div style={{ background:`linear-gradient(160deg,${T.cream} 0%,${T.bg} 100%)`, padding:'52px 22px 20px', borderBottom:`1px solid ${T.line}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, color:T.muted, letterSpacing:1 }}>{greeting}</div>
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, color:T.ink, lineHeight:1.2, marginTop:2 }}>
              Waktunya <em style={{ fontStyle:'italic', color:T.teal }}>Fokus</em>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <div style={{ background:T.amberBg, border:`1px solid ${T.amberLine}`, borderRadius:20, padding:'5px 11px', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:14 }}>🔥</span>
              <span style={{ fontSize:12, fontWeight:800, color:T.amber }}>{streak}</span>
              <span style={{ fontSize:9, color:T.muted }}>hari</span>
            </div>
          </div>
        </div>

        {/* Today quick stats */}
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          {[
            { val: sessionCount,                  lbl:'Sesi', color:T.teal  },
            { val: fmt.mins(totalFocusMinutes),   lbl:'Fokus', color:T.amber },
            { val: sessions.length > 0 ? sessions[sessions.length-1].time : '—', lbl:'Terakhir', color:T.slate },
          ].map(s => (
            <div key={s.lbl} style={{ flex:1, background:T.white, borderRadius:14, padding:'10px 8px', textAlign:'center', border:`1px solid ${T.line}`, boxShadow:`0 2px 8px rgba(44,36,22,0.05)` }}>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:17, color:s.color, fontWeight:600, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:1.2, textTransform:'uppercase', marginTop:2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'20px 20px 0' }}>

        {/* ── Mode Chips ── */}
        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {[
            { key:'pomodoro', label:'🍅 Pomodoro' },
            { key:'deepwork', label:'🎯 Deep Work' },
            { key:'break',    label:'☕ Istirahat' },
          ].map(m => (
            <button key={m.key} onClick={()=>setMode(m.key)}
              style={{ flex:1, padding:'8px 4px', borderRadius:12, border:`1.5px solid ${mode===m.key?T.teal:T.line}`, background:mode===m.key?T.teal:T.white, color:mode===m.key?'#fff':T.slate, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all 0.2s' }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Deep work custom duration */}
        {mode === 'deepwork' && !timerRunning && (
          <div style={{ background:T.amberBg, border:`1px solid ${T.amberLine}`, borderRadius:14, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:12, color:T.slate }}>Durasi deep work:</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {[25,45,50,90].map(m => (
                <button key={m} onClick={()=>setDeepWorkMinutes(m)}
                  style={{ width:36, height:28, borderRadius:8, border:`1.5px solid ${deepWorkMinutes===m?T.amber:T.amberLine}`, background:deepWorkMinutes===m?T.amber:'transparent', color:deepWorkMinutes===m?'#fff':T.amber, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Timer Ring ── */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
          <div style={{ position:'relative', width:210, height:210 }}>
            {/* Background circle */}
            <svg width="210" height="210" viewBox="0 0 210 210" style={{ transform:'rotate(-90deg)', position:'absolute', top:0, left:0 }}>
              <circle cx="105" cy="105" r={r} fill="none" stroke={T.line} strokeWidth="9"/>
              <circle cx="105" cy="105" r={r} fill="none"
                stroke={`url(#timerGrad)`} strokeWidth="9"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: timerRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease' }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={ringColor}/>
                  <stop offset="100%" stopColor={ringColor2}/>
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:48, color:T.ink, fontWeight:600, lineHeight:1, letterSpacing:-1 }}>
                {fmt.time(secondsLeft)}
              </div>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:'uppercase', marginTop:4 }}>
                {modeLabel[mode]}
              </div>
              {timerRunning && (
                <div style={{ fontSize:10, color:T.teal, fontWeight:600, marginTop:6, animation:'pulse 2s ease-in-out infinite' }}>
                  ● sedang fokus
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:12, marginTop:16, alignItems:'center' }}>
            <button onClick={stopTimer} style={{ width:40, height:40, borderRadius:12, background:T.bg2, border:`1.5px solid ${T.line}`, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:T.slate }}>
              ⏹
            </button>
            <button onClick={timerRunning ? pauseTimer : startTimer}
              style={{ width:64, height:64, borderRadius:20, background:`linear-gradient(135deg,${T.teal},${T.teal2})`, border:'none', cursor:'pointer', fontSize:26, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 28px ${T.teal}44`, transition:'transform 0.15s ease' }}>
              {timerRunning ? '⏸' : '▶️'}
            </button>
            <button onClick={()=>{ stopTimer(); setMode('break') }} style={{ width:40, height:40, borderRadius:12, background:T.amberBg, border:`1.5px solid ${T.amberLine}`, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
              ☕
            </button>
          </div>
        </div>

        {/* ── Current Task Input ── */}
        <Card style={{ padding:'14px 16px', marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:T.muted, textTransform:'uppercase', marginBottom:8 }}>Sedang Mengerjakan</div>
          <input
            value={currentTask}
            onChange={e=>setCurrentTask(e.target.value)}
            placeholder="Nulis laporan, belajar materi, coding..."
            style={{ width:'100%', background:T.bg, border:`1.5px solid ${T.line}`, borderRadius:11, padding:'10px 13px', fontSize:13, color:T.ink, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:'none' }}
          />
        </Card>

        {/* ── Today's Sessions ── */}
        {sessions.length > 0 && (
          <>
            <SectionLabel action={sessions.length>3?'Lihat Statistik →':''} onAction={()=>navigate('stats')}>
              Sesi Hari Ini
            </SectionLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {sessions.slice(-3).reverse().map((s,i) => (
                <Card key={i} style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, background: s.mode==='pomodoro'?T.tealBg:T.amberBg, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                      {s.mode==='pomodoro'?'🍅':'🎯'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>{s.task}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{s.time} · {s.duration} menit</div>
                    </div>
                    <div style={{ fontSize:10, fontWeight:600, color:T.teal, background:T.tealBg, padding:'3px 8px', borderRadius:8 }}>+{s.duration}m</div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {sessions.length === 0 && (
          <Card style={{ padding:'28px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🌱</div>
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, color:T.ink, marginBottom:4 }}>Mulai Sesi Pertamamu</div>
            <div style={{ fontSize:12, color:T.muted, lineHeight:1.6 }}>Tekan ▶️ untuk mulai timer.<br/>Setiap sesi dicatat otomatis.</div>
          </Card>
        )}

      </div>
    </div>
  )
}
