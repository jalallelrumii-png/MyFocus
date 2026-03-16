import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { T, Btn, Card, SectionLabel, MoodPicker } from '../components/ui'

const today = () => new Date().toISOString().split('T')[0]
const dateLabel = (iso) => new Date(iso+'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

export function JournalPage() {
  const { saveJournal, getJournal, journals } = useStore()
  const [tab, setTab]             = useState('today')
  const [morning, setMorning]     = useState('')
  const [evening, setEvening]     = useState('')
  const [mood, setMood]           = useState(-1)
  const [saved, setSaved]         = useState(false)

  const todayStr = today()
  const hour     = new Date().getHours()

  useEffect(() => {
    const j = getJournal(todayStr)
    setMorning(j.morning || '')
    setEvening(j.evening || '')
    setMood(j.mood ?? -1)
  }, [])

  const handleSave = () => {
    if (!morning.trim() && !evening.trim()) return
    saveJournal(todayStr, { morning, evening, mood })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // History entries
  const historyDates = Object.keys(journals)
    .filter(d => d !== todayStr)
    .sort((a,b) => b.localeCompare(a))
    .slice(0,7)

  const moodEmoji  = ['😔','😐','🙂','😊','🤩']
  const moodColors = [T.red, T.slate, T.teal, T.teal, T.amber]

  const prompts = {
    morning: [
      'Apa 3 hal yang ingin kamu selesaikan hari ini?',
      'Bagaimana perasaanmu pagi ini?',
      'Apa yang membuatmu bersemangat hari ini?',
    ],
    evening: [
      'Apa pencapaian terbaikmu hari ini?',
      'Apa yang bisa kamu lakukan lebih baik besok?',
      'Hal apa yang kamu syukuri hari ini?',
    ],
  }

  const activePrompt = hour < 12 ? prompts.morning : prompts.evening
  const [promptIdx] = useState(Math.floor(Math.random() * 3))

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:T.bg, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:90 }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(160deg,${T.cream} 0%,${T.bg} 100%)`, padding:'52px 22px 20px', borderBottom:`1px solid ${T.line}` }}>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, color:T.ink, lineHeight:1.2 }}>
          Jurnal <em style={{ fontStyle:'italic', color:T.amber }}>Harianmu</em> 📓
        </div>
        <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{dateLabel(todayStr)}</div>

        {/* Tab */}
        <div style={{ display:'flex', gap:6, marginTop:14 }}>
          {[{k:'today',label:'Hari Ini'},{k:'history',label:'Riwayat'}].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)}
              style={{ flex:1, padding:'8px', borderRadius:12, border:`1.5px solid ${tab===t.k?T.teal:T.line}`, background:tab===t.k?T.teal:T.white, color:tab===t.k?'#fff':T.slate, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'today' ? (
        <div style={{ padding:'20px 20px 0' }}>

          {/* Mood */}
          <Card style={{ padding:'16px', marginBottom:14 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:T.muted, textTransform:'uppercase', marginBottom:12 }}>Suasana Hati Hari Ini</div>
            <MoodPicker value={mood} onChange={setMood}/>
            {mood >= 0 && (
              <div style={{ textAlign:'center', marginTop:10, fontSize:12, color:moodColors[mood], fontWeight:600 }}>
                {['Hari yang berat, semangat!','Hari biasa, tetap positif!','Lumayan oke nih!','Hari yang baik, terus pertahankan!','Luar biasa! Kamu bersinar hari ini!'][mood]}
              </div>
            )}
          </Card>

          {/* Morning */}
          <Card style={{ padding:'16px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:32, height:32, background:T.amberBg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>☀️</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>Renungan Pagi</div>
                <div style={{ fontSize:10, color:T.muted }}>Niat & target hari ini</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:T.muted, fontStyle:'italic', marginBottom:8, lineHeight:1.5, fontFamily:"'Crimson Pro',serif" }}>
              "{activePrompt[0]}"
            </div>
            <textarea value={morning} onChange={e=>setMorning(e.target.value)}
              placeholder="Tulis renungan pagimu di sini..."
              rows={3} maxLength={500}
              style={{ width:'100%', fontFamily:"'Crimson Pro',serif", fontStyle: morning?'normal':'italic', background:T.bg, border:`1.5px solid ${T.line}`, borderRadius:11, padding:'10px 13px', fontSize:13, color:T.ink, outline:'none', resize:'none', lineHeight:1.7 }}/>
            <div style={{ textAlign:'right', fontSize:10, color:T.muted, marginTop:3 }}>{morning.length}/500</div>
          </Card>

          {/* Evening */}
          <Card style={{ padding:'16px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:32, height:32, background:'#FFF0E8', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌙</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>Refleksi Malam</div>
                <div style={{ fontSize:10, color:T.muted }}>Apa yang sudah tercapai</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:T.muted, fontStyle:'italic', marginBottom:8, lineHeight:1.5, fontFamily:"'Crimson Pro',serif" }}>
              "{prompts.evening[promptIdx]}"
            </div>
            <textarea value={evening} onChange={e=>setEvening(e.target.value)}
              placeholder="Tulis refleksi malammu di sini..."
              rows={3} maxLength={500}
              style={{ width:'100%', fontFamily:"'Crimson Pro',serif", fontStyle: evening?'normal':'italic', background:T.bg, border:`1.5px solid ${T.line}`, borderRadius:11, padding:'10px 13px', fontSize:13, color:T.ink, outline:'none', resize:'none', lineHeight:1.7 }}/>
            <div style={{ textAlign:'right', fontSize:10, color:T.muted, marginTop:3 }}>{evening.length}/500</div>
          </Card>

          <Btn onClick={handleSave} size="full" disabled={!morning.trim()&&!evening.trim()} style={{ background: saved?T.green:undefined }}>
            {saved ? '✅ Tersimpan!' : '💾 Simpan Jurnal Hari Ini'}
          </Btn>
        </div>

      ) : (
        /* History */
        <div style={{ padding:'20px 20px 0' }}>
          {historyDates.length === 0 ? (
            <Card style={{ padding:'40px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📓</div>
              <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, color:T.ink }}>Belum ada riwayat jurnal</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>Mulai tulis jurnal hari ini!</div>
            </Card>
          ) : historyDates.map(d => {
            const j = journals[d]
            return (
              <Card key={d} style={{ padding:'14px 16px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, fontWeight:600, color:T.ink }}>
                    {new Date(d+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short'})}
                  </div>
                  {j.mood >= 0 && <span style={{ fontSize:20 }}>{moodEmoji[j.mood]}</span>}
                </div>
                {j.morning && (
                  <div style={{ fontSize:12, color:T.slate, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', fontFamily:"'Crimson Pro',serif", fontStyle:'italic' }}>
                    ☀️ "{j.morning}"
                  </div>
                )}
                {j.evening && (
                  <div style={{ fontSize:12, color:T.slate, lineHeight:1.6, marginTop:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', fontFamily:"'Crimson Pro',serif", fontStyle:'italic' }}>
                    🌙 "{j.evening}"
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
