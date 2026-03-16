import { useState } from 'react'
import { useStore } from '../store'
import { T } from '../components/ui'
import { resumeAudio } from '../lib/sound'

const STEPS = [
  {
    emoji: '🎯',
    title: 'Selamat datang di FokusKu',
    subtitle: 'Teman produktivitas harianmu',
    desc: 'Timer fokus, jurnal harian, dan AI coach dalam satu app yang hangat dan nyaman.',
    color: T.teal,
  },
  {
    emoji: '⏱',
    title: 'Timer Pomodoro & Deep Work',
    subtitle: 'Fokus lebih dalam, lebih lama',
    desc: 'Gunakan teknik Pomodoro 25 menit atau Deep Work bebas durasi. Setiap sesi tercatat otomatis.',
    color: T.amber,
  },
  {
    emoji: '🤖',
    title: 'AI Coach Pribadi',
    subtitle: 'Analisis yang personal untukmu',
    desc: 'AI membaca data produktivitas & jurnalmu, lalu memberikan insight dan motivasi yang spesifik.',
    color: '#2B7FBF',
  },
]

export function OnboardingPage() {
  const { completeOnboarding, requestNotif, soundEnabled, toggleSound } = useStore()
  const [step, setStep]   = useState(0)
  const [name, setName]   = useState('')
  const [notifAsked, setNotifAsked] = useState(false)

  const isLast = step === STEPS.length

  const handleNext = () => {
    resumeAudio()
    if (step < STEPS.length) setStep(step + 1)
  }

  const handleNotif = async () => {
    await requestNotif()
    setNotifAsked(true)
  }

  const handleStart = () => {
    completeOnboarding(name.trim())
  }

  const s = STEPS[step]

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:`linear-gradient(160deg,${T.cream} 0%,${T.bg2} 100%)`, minHeight:'100vh', maxWidth:430, margin:'0 auto', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>

      {/* Skip button */}
      {step < STEPS.length && (
        <button onClick={handleStart} style={{ position:'absolute', top:52, right:20, background:'transparent', border:'none', color:T.muted, fontSize:12, fontWeight:600, cursor:'pointer', padding:'6px 10px', zIndex:10 }}>
          Lewati →
        </button>
      )}

      {/* Step dots */}
      <div style={{ position:'absolute', top:58, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6, zIndex:10 }}>
        {STEPS.map((_,i) => (
          <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:3, background: i===step?T.teal:T.line, transition:'all 0.3s ease' }}/>
        ))}
        <div style={{ width: step===STEPS.length?20:6, height:6, borderRadius:3, background: step===STEPS.length?T.teal:T.line, transition:'all 0.3s ease' }}/>
      </div>

      {/* Content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 28px 40px', gap:0 }}>

        {step < STEPS.length ? (
          /* Feature slides */
          <div key={step} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, animation:'fadeInUp 0.4s ease both', width:'100%' }}>
            <div style={{ width:110, height:110, background:`linear-gradient(135deg,${s.color}22,${s.color}11)`, border:`2px solid ${s.color}33`, borderRadius:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>
              {s.emoji}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:s.color, textTransform:'uppercase', marginBottom:8 }}>{s.subtitle}</div>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:28, color:T.ink, lineHeight:1.25, marginBottom:12 }}>{s.title}</div>
              <div style={{ fontSize:14, color:T.slate, lineHeight:1.75, maxWidth:320 }}>{s.desc}</div>
            </div>

            {/* Feature highlights per step */}
            {step === 0 && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
                {['⏱ Timer','📓 Jurnal','📊 Statistik','🤖 AI Coach'].map(f => (
                  <div key={f} style={{ background:T.white, border:`1px solid ${T.line}`, borderRadius:20, padding:'5px 13px', fontSize:11, fontWeight:600, color:T.teal }}>
                    {f}
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div style={{ background:T.white, border:`1px solid ${T.line}`, borderRadius:16, padding:'14px 16px', width:'100%', marginTop:4 }}>
                {[
                  ['🍅','Pomodoro','25 menit fokus + 5 menit istirahat'],
                  ['🎯','Deep Work','25–90 menit bebas, tanpa interupsi'],
                  ['🔥','Streak','Catat konsistensi harianmu'],
                ].map(([e,t,d]) => (
                  <div key={t} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${T.line}` }}>
                    <span style={{ fontSize:20 }}>{e}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>{t}</div>
                      <div style={{ fontSize:10, color:T.muted }}>{d}</div>
                    </div>
                  </div>
                )).map((el,i,arr) => i===arr.length-1 ? <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 0' }}>{el.props.children}</div> : el)}
              </div>
            )}

            {step === 2 && (
              <div style={{ background:T.white, border:`1px solid ${T.line}`, borderRadius:16, padding:'14px 16px', width:'100%', marginTop:4 }}>
                {[
                  ['📊','Analisis Harian','Review produktivitas & saran spesifik'],
                  ['📓','Insight Jurnal','AI baca jurnalmu & kasih refleksi'],
                  ['💡','Tips Personal','Berdasarkan pola kerjamu sendiri'],
                ].map(([e,t,d],i,arr) => (
                  <div key={t} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 0', borderBottom: i<arr.length-1?`1px solid ${T.line}`:'none' }}>
                    <span style={{ fontSize:20 }}>{e}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>{t}</div>
                      <div style={{ fontSize:10, color:T.muted }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (
          /* Final setup step */
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, animation:'fadeInUp 0.4s ease both', width:'100%' }}>
            <div style={{ width:90, height:90, background:`linear-gradient(135deg,${T.teal},${T.teal2})`, borderRadius:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, boxShadow:`0 12px 32px ${T.teal}44` }}>
              🌱
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, color:T.ink, marginBottom:8 }}>Hampir Siap!</div>
              <div style={{ fontSize:13, color:T.slate, lineHeight:1.6 }}>Siapkan FokusKu sesuai kamu</div>
            </div>

            {/* Name input */}
            <div style={{ width:'100%' }}>
              <label style={{ fontSize:11, fontWeight:700, color:T.slate, letterSpacing:0.5, display:'block', marginBottom:6 }}>Nama kamu (opsional)</label>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="Mis: Rizki, Budi, Siti..."
                style={{ width:'100%', background:T.white, border:`1.5px solid ${T.line}`, borderRadius:13, padding:'12px 16px', fontSize:14, color:T.ink, outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
              <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>
                App akan menyapa dengan namamu 👋
              </div>
            </div>

            {/* Sound toggle */}
            <div style={{ width:'100%', background:T.white, border:`1px solid ${T.line}`, borderRadius:16, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:T.ink }}>🔔 Suara & Notifikasi</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>Bunyi saat timer selesai</div>
              </div>
              <div onClick={()=>{ resumeAudio(); toggleSound() }}
                style={{ width:46, height:26, borderRadius:13, background:soundEnabled?T.teal:T.line, cursor:'pointer', position:'relative', transition:'background 0.3s' }}>
                <div style={{ position:'absolute', top:3, left:soundEnabled?22:3, width:20, height:20, borderRadius:10, background:'#fff', transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
              </div>
            </div>

            {/* Notif permission */}
            {!notifAsked ? (
              <button onClick={handleNotif}
                style={{ width:'100%', background:T.amberBg, border:`1.5px solid ${T.amberLine}`, borderRadius:14, padding:'12px', fontSize:13, fontWeight:700, color:T.amber, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                🔔 Izinkan Notifikasi Browser
              </button>
            ) : (
              <div style={{ width:'100%', background:'#E8F5F0', border:`1px solid #B2E4D0`, borderRadius:14, padding:'11px 16px', fontSize:12, color:T.teal, fontWeight:600, textAlign:'center' }}>
                ✅ Notifikasi sudah aktif!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div style={{ padding:'0 28px 48px' }}>
        {step < STEPS.length ? (
          <button onClick={handleNext}
            style={{ width:'100%', background:`linear-gradient(135deg,${T.teal},${T.teal2})`, border:'none', borderRadius:16, padding:'15px', fontSize:15, fontWeight:800, color:'#fff', cursor:'pointer', boxShadow:`0 8px 24px ${T.teal}44`, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:0.3 }}>
            {step === STEPS.length-1 ? 'Lanjut Setup →' : 'Selanjutnya →'}
          </button>
        ) : (
          <button onClick={handleStart}
            style={{ width:'100%', background:`linear-gradient(135deg,${T.teal},${T.teal2})`, border:'none', borderRadius:16, padding:'15px', fontSize:15, fontWeight:800, color:'#fff', cursor:'pointer', boxShadow:`0 8px 24px ${T.teal}44`, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            🚀 Mulai FokusKu!
          </button>
        )}
      </div>
    </div>
  )
}
