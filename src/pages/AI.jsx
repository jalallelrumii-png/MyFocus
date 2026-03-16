import { useState } from 'react'
import { useStore } from '../store'
import { useTokens, Btn, Card, SectionLabel } from '../components/ui'

const GROQ_KEY = () => import.meta.env.VITE_GROQ_API_KEY

async function askGroq(prompt) {
  const key = GROQ_KEY()
  if (!key) throw new Error('NO_KEY')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah coach produktivitas personal yang bijak dan suportif. Balas dalam Bahasa Indonesia yang hangat, singkat, dan actionable. Maksimal 3 paragraf pendek. Jangan pakai bullet points panjang — tulis seperti teman yang ngobrol.'
        },
        { role: 'user', content: prompt }
      ]
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices?.[0]?.message?.content || 'Tidak ada respons.'
}

const ANALYSIS_TYPES = [
  {
    key: 'daily',
    emoji: '📊',
    label: 'Analisis Hari Ini',
    desc: 'Review produktivitas & saran untuk sore/malam',
    color: T.teal,
    bg: T.tealBg,
  },
  {
    key: 'journal',
    emoji: '📓',
    label: 'Insight Jurnal',
    desc: 'AI baca jurnalmu & kasih refleksi bermakna',
    color: T.amber,
    bg: T.amberBg,
  },
  {
    key: 'tips',
    emoji: '💡',
    label: 'Tips Fokus Personal',
    desc: 'Saran spesifik berdasarkan pola kerjamu',
    color: '#2B7FBF',
    bg: '#EEF5FF',
  },
  {
    key: 'motivation',
    emoji: '🔥',
    label: 'Motivasi Sekarang',
    desc: 'Dorongan semangat saat kamu butuhkan',
    color: '#C0392B',
    bg: '#FEF0EE',
  },
]

export function AIPage() {
  const { sessions, totalFocusMinutes, sessionCount, streak, getJournal, getWeekStats, darkMode } = useStore()
  const T = useTokens(darkMode)
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [activeType, setActive] = useState(null)
  const [noKey, setNoKey]     = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const journal  = getJournal(todayStr)
  const weekData = getWeekStats()
  const totalWeekMins = weekData.reduce((a,d) => a+d.mins, 0)

  const buildPrompt = (type) => {
    const ctx = `
Data produktivitas hari ini:
- Sesi selesai: ${sessionCount}
- Total fokus: ${totalFocusMinutes} menit
- Tugas dikerjakan: ${sessions.map(s=>s.task).filter(Boolean).join(', ') || 'tidak dicatat'}
- Streak: ${streak} hari berturut-turut
- Total fokus minggu ini: ${totalWeekMins} menit

Jurnal hari ini:
- Pagi: "${journal.morning || 'belum diisi'}"
- Malam: "${journal.evening || 'belum diisi'}"
- Mood: ${journal.mood >= 0 ? ['Berat','Biasa','Oke','Baik','Luar Biasa'][journal.mood] : 'belum diisi'}
`
    const prompts = {
      daily:      `${ctx}\nBerikan analisis produktivitas hari ini yang jujur dan konstruktif. Apa yang berjalan baik? Apa yang bisa ditingkatkan? Satu saran konkret untuk sisa hari ini.`,
      journal:    `${ctx}\nBaca jurnal harian ini dan berikan refleksi yang bermakna. Apa pola yang kamu lihat? Apa insight yang bisa membantu dia berkembang?`,
      tips:       `${ctx}\nBerdasarkan data ini, berikan 2-3 tips fokus yang SPESIFIK dan personal untuk orang ini. Bukan tips generik — sesuaikan dengan datanya.`,
      motivation: `${ctx}\nBerikan motivasi yang tulus dan personal berdasarkan perjalanan produktivitas orang ini. Akui perjuangannya, rayakan pencapaiannya, dorong dia untuk terus.`,
    }
    return prompts[type]
  }

  const handleAnalyze = async (type) => {
    setActive(type)
    setResult('')
    setLoading(true)
    setNoKey(false)

    try {
      const text = await askGroq(buildPrompt(type))
      setResult(text)
    } catch (e) {
      if (e.message === 'NO_KEY') setNoKey(true)
      else setResult(`❌ Error: ${e.message}`)
    }
    setLoading(false)
  }

  const activeConfig = ANALYSIS_TYPES.find(t => t.key === activeType)

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:T.bg, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:90, transition:'background 0.3s' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(160deg,${T.cream} 0%,${T.bg} 100%)`, padding:'52px 22px 20px', borderBottom:`1px solid ${T.line}` }}>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, color:T.ink, lineHeight:1.2 }}>
          AI <em style={{ fontStyle:'italic', color:T.teal }}>Coach</em> Produktivitas 🤖
        </div>
        <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>Analisis personal berdasarkan data kamu · Groq AI</div>
      </div>

      <div style={{ padding:'20px 20px 0' }}>

        {/* No API key warning */}
        {noKey && (
          <div style={{ background:T.amberBg, border:`1px solid ${T.amberLine}`, borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.amber, marginBottom:6 }}>⚙️ API Key Groq belum dipasang</div>
            <div style={{ fontSize:11, color:T.slate, lineHeight:1.7 }}>
              Cara pasang (gratis, tanpa CC):<br/>
              1. Daftar di <strong>console.groq.com</strong><br/>
              2. Buat API Key → copy<br/>
              3. Vercel → Settings → Environment Variables<br/>
              4. Name: <strong>VITE_GROQ_API_KEY</strong><br/>
              5. Save → Redeploy ✅
            </div>
          </div>
        )}

        {/* Today's snapshot */}
        <SectionLabel>Data Kamu Hari Ini</SectionLabel>
        <Card style={{ padding:'14px 16px', marginBottom:16 }}>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[
              { label:'Sesi', val:sessionCount, emoji:'🍅' },
              { label:'Fokus', val:`${totalFocusMinutes}m`, emoji:'⏱' },
              { label:'Streak', val:`${streak} hari`, emoji:'🔥' },
              { label:'Mood', val: journal.mood>=0 ? ['😔','😐','🙂','😊','🤩'][journal.mood] : '—', emoji:'' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', flex:'1 0 40px' }}>
                <div style={{ fontSize:18 }}>{s.emoji}</div>
                <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, color:T.ink, fontWeight:600 }}>{s.val}</div>
                <div style={{ fontSize:9, color:T.muted, letterSpacing:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Analysis types */}
        <SectionLabel>Pilih Analisis</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {ANALYSIS_TYPES.map(t => (
            <div key={t.key} onClick={()=>handleAnalyze(t.key)}
              style={{ background: activeType===t.key ? t.color : T.white, border:`1.5px solid ${activeType===t.key?t.color:T.line}`, borderRadius:16, padding:'14px 12px', cursor:'pointer', transition:'all 0.2s', boxShadow: activeType===t.key?`0 4px 16px ${t.color}33`:`0 2px 8px rgba(44,36,22,0.05)` }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{t.emoji}</div>
              <div style={{ fontSize:12, fontWeight:700, color: activeType===t.key?'#fff':T.ink, marginBottom:3 }}>{t.label}</div>
              <div style={{ fontSize:10, color: activeType===t.key?'rgba(255,255,255,0.75)':T.muted, lineHeight:1.4 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Result */}
        {(loading || result) && (
          <Card style={{ padding:'18px', marginBottom:16, border:`1.5px solid ${activeConfig?.color || T.line}22` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:32, height:32, background: activeConfig?.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{activeConfig?.emoji}</div>
              <div style={{ fontSize:12, fontWeight:700, color: activeConfig?.color }}>{activeConfig?.label}</div>
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:28, marginBottom:8, animation:'pulse 1.5s ease-in-out infinite' }}>🤔</div>
                <div style={{ fontSize:12, color:T.teal, fontWeight:600, letterSpacing:1 }}>AI sedang menganalisis...</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>Membaca data produktivitasmu</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, color:T.ink, lineHeight:1.85, whiteSpace:'pre-wrap' }}>
                  {result}
                </div>
                <div style={{ display:'flex', gap:8, marginTop:14 }}>
                  <Btn onClick={()=>{ navigator.clipboard.writeText(result) }} variant="secondary" size="sm">📋 Copy</Btn>
                  <Btn onClick={()=>handleAnalyze(activeType)} variant="ghost" size="sm">🔄 Generate Ulang</Btn>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Tip */}
        {!activeType && (
          <Card style={{ padding:'16px', background:`linear-gradient(135deg,${T.tealBg},${T.cream})`, border:`1px solid ${T.tealLine}` }}>
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:14, color:T.ink, fontStyle:'italic', lineHeight:1.7, textAlign:'center' }}>
              Pilih jenis analisis di atas dan biarkan AI membaca data produktivitasmu secara personal. 🌱
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
