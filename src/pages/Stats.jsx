import { useStore } from '../store'
import { useTokens, Card, SectionLabel } from '../components/ui'

export function StatsPage() {
  const { getWeekStats, streak, sessions, journals, darkMode, totalFocusMinutes } = useStore()
  const T = useTokens(darkMode)
  const weekData = getWeekStats()

  const maxMins    = Math.max(...weekData.map(d => d.mins), 1)
  const totalWeek  = weekData.reduce((a,d) => a+d.mins, 0)
  const avgPerDay  = Math.round(totalWeek / 7)
  const activeDays = weekData.filter(d => d.mins > 0).length
  const moodEmoji  = ['😔','😐','🙂','😊','🤩']

  // Journal mood this week
  const today = new Date()
  const journalStore = useStore.getState().journals
  const moodData = weekData.map(d => ({
    ...d,
    mood: journalStore[d.date]?.mood ?? -1
  }))

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:T.bg, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:90, transition:'background 0.3s' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(160deg,${T.cream} 0%,${T.bg} 100%)`, padding:'52px 22px 20px', borderBottom:`1px solid ${T.line}` }}>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, color:T.ink, lineHeight:1.2 }}>
          Statistik <em style={{ fontStyle:'italic', color:T.teal }}>Produktivitas</em> 📊
        </div>
        <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>7 hari terakhir</div>
      </div>

      <div style={{ padding:'20px 20px 0' }}>

        {/* Summary pills */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
          {[
            { val:`${streak}🔥`,         lbl:'Hari Streak',    color:T.amber },
            { val:activeDays,             lbl:'Hari Aktif',     color:T.teal  },
            { val:`${avgPerDay}m`,        lbl:'Rata-rata/hari', color:T.slate },
          ].map(s => (
            <Card key={s.lbl} style={{ padding:'12px 8px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, color:s.color, fontWeight:600, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:1, textTransform:'uppercase', marginTop:3 }}>{s.lbl}</div>
            </Card>
          ))}
        </div>

        {/* Weekly bar chart */}
        <SectionLabel>Menit Fokus Per Hari</SectionLabel>
        <Card style={{ padding:'16px 14px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100 }}>
            {weekData.map(d => {
              const h = maxMins > 0 ? Math.max(4, (d.mins / maxMins) * 88) : 4
              const isToday = d.date === new Date().toISOString().split('T')[0]
              return (
                <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{d.mins > 0 ? `${d.mins}m` : ''}</div>
                  <div style={{ width:'100%', height:h, background: isToday ? T.teal : d.mins>0 ? T.tealBg : T.line, borderRadius:'5px 5px 0 0', border: isToday?`1.5px solid ${T.teal2}`:'none', transition:'height 0.5s ease', position:'relative', overflow:'hidden' }}>
                    {isToday && d.mins > 0 && <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg,${T.teal2},${T.teal})` }}/>}
                  </div>
                  <div style={{ fontSize:9, color: isToday?T.teal:T.muted, fontWeight: isToday?700:400 }}>{d.day}</div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${T.line}`, display:'flex', justifyContent:'space-between', fontSize:11, color:T.muted }}>
            <span>Total minggu ini</span>
            <span style={{ fontWeight:700, color:T.teal }}>{totalWeek} menit</span>
          </div>
        </Card>

        {/* Mood chart this week */}
        <SectionLabel>Suasana Hati 7 Hari</SectionLabel>
        <Card style={{ padding:'16px 14px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            {moodData.map(d => (
              <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ fontSize:22, opacity: d.mood>=0?1:0.2 }}>{d.mood>=0?moodEmoji[d.mood]:'○'}</div>
                <div style={{ fontSize:9, color:T.muted }}>{d.day}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Session breakdown */}
        <SectionLabel>Sesi Hari Ini ({sessions.length})</SectionLabel>
        {sessions.length === 0 ? (
          <Card style={{ padding:'28px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⏱</div>
            <div style={{ fontSize:13, color:T.muted }}>Belum ada sesi hari ini</div>
          </Card>
        ) : (
          <>
            {sessions.slice().reverse().map((s,i) => (
              <Card key={i} style={{ padding:'11px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:34, height:34, background: s.mode==='pomodoro'?T.tealBg:T.amberBg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                    {s.mode==='pomodoro'?'🍅':'🎯'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>{s.task}</div>
                    <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{s.time} · {s.mode==='pomodoro'?'Pomodoro':'Deep Work'}</div>
                  </div>
                  <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, color:T.teal, fontWeight:600 }}>{s.duration}m</div>
                </div>
              </Card>
            ))}

            {/* total */}
            <div style={{ background:T.tealBg, border:`1px solid ${T.tealLine}`, borderRadius:14, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
              <div style={{ fontSize:12, color:T.teal, fontWeight:700 }}>Total Fokus Hari Ini</div>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, color:T.teal, fontWeight:700 }}>
                {totalFocusMinutes >= 60 ? `${Math.floor(totalFocusMinutes/60)}j ${totalFocusMinutes%60}m` : `${totalFocusMinutes}m`}
              </div>
            </div>
          </>
        )}

        {/* Motivational quote */}
        <Card style={{ padding:'16px', marginTop:16, background:`linear-gradient(135deg,${T.amberBg},${T.cream})`, border:`1px solid ${T.amberLine}` }}>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color:T.ink, fontStyle:'italic', lineHeight:1.7, textAlign:'center' }}>
            "Produktivitas bukan tentang sibuk, tapi tentang menghasilkan yang berarti."
          </div>
          <div style={{ textAlign:'center', fontSize:10, color:T.muted, marginTop:6 }}>— FokusKu Daily Quote</div>
        </Card>

      </div>
    </div>
  )
}
