import { useStore } from '../store'
import { useTokens, Toggle, Card, SectionLabel } from '../components/ui'
import { resumeAudio } from '../lib/sound'
import { registerSW } from '../lib/notifications'

// ── Hour formatter ────────────────────────────────────────────
const fmtHour = (h) => {
  const period = h < 12 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${String(h12).padStart(2,'0')}:00 ${period}`
}

// ── Hour Picker ───────────────────────────────────────────────
function HourPicker({ value, onChange, min=5, max=23, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <button onClick={()=>onChange(Math.max(min, value-1))}
        style={{ width:32, height:32, borderRadius:10, background:C.tealBg, border:`1px solid ${C.tealLine}`, cursor:'pointer', fontSize:16, color:C.teal, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
      <div style={{ minWidth:90, textAlign:'center', fontSize:13, fontWeight:700, color:C.ink }}>{fmtHour(value)}</div>
      <button onClick={()=>onChange(Math.min(max, value+1))}
        style={{ width:32, height:32, borderRadius:10, background:C.tealBg, border:`1px solid ${C.tealLine}`, cursor:'pointer', fontSize:16, color:C.teal, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
    </div>
  )
}

// ── SETTINGS PAGE ─────────────────────────────────────────────
export function SettingsPage() {
  const {
    darkMode, toggleDarkMode,
    soundEnabled, toggleSound,
    notifEnabled, requestNotif,
    morningHour, setMorningHour,
    eveningHour, setEveningHour,
    morningOn,   toggleMorningOn,
    eveningOn,   toggleEveningOn,
    streakAlertOn, toggleStreakAlert,
    userName, streak,
  } = useStore()

  const C = useTokens(darkMode)

  const handleEnableNotif = async () => {
    await registerSW()
    const granted = await requestNotif()
    if (!granted) {
      useStore.getState().showToast('Izin notifikasi ditolak. Aktifkan dari setelan browser.', 'warning')
    }
  }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:C.bg, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:90, transition:'background 0.3s' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(160deg,${C.cream} 0%,${C.bg} 100%)`, padding:'52px 22px 20px', borderBottom:`1px solid ${C.line}` }}>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, color:C.ink }}>
          Setelan <em style={{ fontStyle:'italic', color:C.teal }}>& Preferensi</em> ⚙️
        </div>
        <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Kustomisasi pengalaman FokusKu kamu</div>
      </div>

      <div style={{ padding:'20px 20px 0' }}>

        {/* ── Profile ── */}
        <SectionLabel C={C}>Profil</SectionLabel>
        <Card C={C} style={{ padding:'14px 16px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:52, height:52, background:`linear-gradient(135deg,${C.teal},${C.teal2})`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Crimson Pro',serif", fontSize:22, color:'#fff', fontWeight:700 }}>
              {userName ? userName[0].toUpperCase() : '🎯'}
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:C.ink }}>{userName || 'Pengguna FokusKu'}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>🔥 {streak} hari streak</div>
            </div>
          </div>
        </Card>

        {/* ── Tampilan ── */}
        <SectionLabel C={C}>Tampilan</SectionLabel>
        <Card C={C} style={{ padding:'0 16px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:`1px solid ${C.line}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>🌙 Mode Gelap</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Tampilan hitam elegan</div>
            </div>
            <Toggle value={darkMode} onChange={toggleDarkMode} C={C}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>☀️ Mode Terang</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Krem hangat Morning Zen</div>
            </div>
            <Toggle value={!darkMode} onChange={toggleDarkMode} C={C}/>
          </div>
        </Card>

        {/* ── Suara ── */}
        <SectionLabel C={C}>Suara & Getar</SectionLabel>
        <Card C={C} style={{ padding:'0 16px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>🔊 Suara Timer</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Bunyi + getar saat sesi selesai</div>
            </div>
            <Toggle value={soundEnabled} onChange={()=>{ resumeAudio(); toggleSound() }} C={C}/>
          </div>
        </Card>

        {/* ── Notifikasi Terjadwal ── */}
        <SectionLabel C={C}>Notifikasi Terjadwal</SectionLabel>

        {!notifEnabled ? (
          <Card C={C} style={{ padding:'16px', marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:6 }}>🔔 Aktifkan Notifikasi</div>
            <div style={{ fontSize:12, color:C.slate, lineHeight:1.7, marginBottom:14 }}>
              Notifikasi terjadwal membantu kamu ingat untuk fokus setiap hari — bahkan saat app ditutup.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
              {[
                ['☀️','Pengingat pagi','Mulai hari dengan fokus'],
                ['📓','Pengingat jurnal','Refleksi sebelum tidur'],
                ['🔥','Peringatan streak','Kalau belum ada sesi sampai malam'],
              ].map(([e,t,d]) => (
                <div key={t} style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:18 }}>{e}</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{t}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleEnableNotif}
              style={{ width:'100%', background:`linear-gradient(135deg,${C.teal},${C.teal2})`, border:'none', borderRadius:13, padding:'12px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:`0 4px 16px ${C.teal}44` }}>
              🔔 Aktifkan Notifikasi Sekarang
            </button>
          </Card>

        ) : (
          <Card C={C} style={{ padding:'0 16px', marginBottom:20 }}>

            {/* Morning reminder */}
            <div style={{ padding:'13px 0', borderBottom:`1px solid ${C.line}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: morningOn ? 10 : 0 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>☀️ Pengingat Pagi</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Motivasi mulai hari fokus</div>
                </div>
                <Toggle value={morningOn} onChange={toggleMorningOn} C={C}/>
              </div>
              {morningOn && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg, borderRadius:10, padding:'8px 12px', marginTop:8 }}>
                  <span style={{ fontSize:11, color:C.muted }}>Jam berapa:</span>
                  <HourPicker value={morningHour} onChange={setMorningHour} min={4} max={11} C={C}/>
                </div>
              )}
            </div>

            {/* Evening journal reminder */}
            <div style={{ padding:'13px 0', borderBottom:`1px solid ${C.line}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: eveningOn ? 10 : 0 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>📓 Pengingat Jurnal Malam</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Refleksi & nulis jurnal</div>
                </div>
                <Toggle value={eveningOn} onChange={toggleEveningOn} C={C}/>
              </div>
              {eveningOn && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg, borderRadius:10, padding:'8px 12px', marginTop:8 }}>
                  <span style={{ fontSize:11, color:C.muted }}>Jam berapa:</span>
                  <HourPicker value={eveningHour} onChange={setEveningHour} min={17} max={23} C={C}/>
                </div>
              )}
            </div>

            {/* Streak alert */}
            <div style={{ padding:'13px 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>🔥 Peringatan Streak</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Notif jam 8 malam jika belum fokus</div>
                </div>
                <Toggle value={streakAlertOn} onChange={toggleStreakAlert} C={C}/>
              </div>
            </div>
          </Card>
        )}

        {/* Notif preview */}
        {notifEnabled && (
          <div style={{ background:C.amberBg, border:`1px solid ${C.amberLine}`, borderRadius:14, padding:'12px 14px', marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.amber, marginBottom:6 }}>💡 Cara Kerja Notifikasi</div>
            <div style={{ fontSize:11, color:C.slate, lineHeight:1.6 }}>
              Notifikasi terjadwal di-set ulang setiap kali kamu membuka app. Pastikan membuka FokusKu minimal sekali sehari agar jadwal tetap aktif.
            </div>
          </div>
        )}

        {/* ── About ── */}
        <SectionLabel C={C}>Tentang</SectionLabel>
        <Card C={C} style={{ padding:'14px 16px', marginBottom:20 }}>
          {[
            ['Versi App', '1.2.0'],
            ['AI Engine', 'Groq llama-3.3-70b'],
            ['Data tersimpan', 'Di perangkatmu (lokal)'],
            ['Notifikasi', notifEnabled ? '✅ Aktif' : '❌ Nonaktif'],
          ].map(([k,v],i,arr) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', paddingBottom: i<arr.length-1?10:0, marginBottom: i<arr.length-1?10:0, borderBottom: i<arr.length-1?`1px solid ${C.line}`:'none' }}>
              <div style={{ fontSize:12, color:C.muted }}>{k}</div>
              <div style={{ fontSize:12, fontWeight:600, color: k==='AI Engine'?C.teal:C.ink }}>{v}</div>
            </div>
          ))}
        </Card>

        {/* Reset */}
        <button onClick={()=>{
          if(confirm('Reset semua data? Streak, sesi, jurnal, dan setelan akan terhapus.')) {
            localStorage.clear()
            window.location.reload()
          }
        }} style={{ width:'100%', background:'transparent', border:`1.5px solid ${C.red}44`, borderRadius:14, padding:'12px', fontSize:13, fontWeight:700, color:C.red, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:12 }}>
          🗑 Reset Semua Data
        </button>

        <div style={{ textAlign:'center', fontSize:11, color:C.muted, lineHeight:1.7, marginBottom:20 }}>
          FokusKu v1.2 · Dibuat untuk produktivitas Indonesia 🇮🇩<br/>
          Data 100% tersimpan di perangkat kamu, tidak ke server manapun.
        </div>
      </div>
    </div>
  )
}
