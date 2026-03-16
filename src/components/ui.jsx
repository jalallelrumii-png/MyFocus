// ── FOKUSKU DESIGN SYSTEM — MORNING ZEN + DARK MODE ─────────

// ── LIGHT TOKENS ─────────────────────────────────────────────
export const T = {
  bg:       '#FDFAF5',
  bg2:      '#F8F3EA',
  cream:    '#F5EDD8',
  white:    '#FFFFFF',
  teal:     '#1A7A6E',
  teal2:    '#22A090',
  teal3:    '#2DC4B2',
  tealBg:   '#E8F5F3',
  tealLine: '#B8DDD9',
  amber:    '#C17D2E',
  amber2:   '#E8A040',
  amberBg:  '#FFF3DC',
  amberLine:'#F0D5A0',
  ink:      '#2C2416',
  ink2:     '#3D3020',
  slate:    '#6B5C42',
  muted:    '#9B8E7A',
  line:     '#EDE5D4',
  line2:    '#E0D5C5',
  green:    '#1A7A4A',
  red:      '#C0392B',
  orange:   '#E67E22',
}

// ── DARK TOKENS ───────────────────────────────────────────────
export const D = {
  bg:       '#12110E',
  bg2:      '#1A1814',
  cream:    '#221F1A',
  white:    '#242018',
  teal:     '#2DC4B2',
  teal2:    '#3DDECE',
  teal3:    '#4DEEE0',
  tealBg:   '#162220',
  tealLine: '#1E3532',
  amber:    '#E8A040',
  amber2:   '#F0C060',
  amberBg:  '#221A0E',
  amberLine:'#3A2A10',
  ink:      '#F0EAE0',
  ink2:     '#D8D0C4',
  slate:    '#A89880',
  muted:    '#6A6050',
  line:     '#2A2620',
  line2:    '#322E26',
  green:    '#2DC47A',
  red:      '#E05050',
  orange:   '#F0A040',
}

// Returns correct token set based on darkMode
export const useTokens = (darkMode) => darkMode ? D : T

export const fmt = {
  time: (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  },
  date: (iso) => new Date(iso+'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' }),
  dateShort: (iso) => new Date(iso+'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short' }),
  mins: (m) => m >= 60 ? `${Math.floor(m/60)}j ${m%60}m` : `${m}m`,
}

// ── COMPONENTS ────────────────────────────────────────────────

export function Btn({ children, onClick, variant='primary', size='md', disabled, style={}, C=T }) {
  const base = {
    fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, border:'none',
    cursor: disabled?'not-allowed':'pointer',
    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
    transition:'all 0.18s ease', opacity: disabled?0.5:1, letterSpacing:0.2,
  }
  const sizes = {
    sm:   { padding:'6px 14px',  fontSize:11, borderRadius:10 },
    md:   { padding:'11px 20px', fontSize:13, borderRadius:13 },
    lg:   { padding:'14px 24px', fontSize:14, borderRadius:15 },
    full: { padding:'14px 24px', fontSize:14, borderRadius:15, width:'100%' },
  }
  const variants = {
    primary:  { background:C.teal,    color:'#fff',   boxShadow:`0 4px 16px ${C.teal}44` },
    secondary:{ background:C.tealBg,  color:C.teal,   border:`1.5px solid ${C.tealLine}` },
    amber:    { background:C.amberBg, color:C.amber,  border:`1.5px solid ${C.amberLine}` },
    ghost:    { background:'transparent', color:C.slate, border:`1.5px solid ${C.line}` },
    danger:   { background:C.red+'22', color:C.red,   border:`1.5px solid ${C.red}44` },
  }
  return (
    <button onClick={disabled?undefined:onClick} style={{...base,...sizes[size],...variants[variant],...style}}>
      {children}
    </button>
  )
}

export function Card({ children, style={}, onClick, C=T }) {
  return (
    <div onClick={onClick} style={{ background:C.white, borderRadius:18, border:`1px solid ${C.line}`, boxShadow:`0 2px 12px rgba(44,36,22,0.06)`, ...style }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children, action, onAction, style={}, C=T }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, ...style }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:C.muted, textTransform:'uppercase' }}>{children}</div>
      {action && <span onClick={onAction} style={{ fontSize:11, color:C.teal, fontWeight:700, cursor:'pointer' }}>{action}</span>}
    </div>
  )
}

export function Toggle({ value, onChange, C=T }) {
  return (
    <div onClick={onChange} style={{ width:46, height:26, borderRadius:13, background:value?C.teal:C.line, cursor:'pointer', position:'relative', transition:'background 0.3s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:value?22:3, width:20, height:20, borderRadius:10, background:'#fff', transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
    </div>
  )
}

export function MoodPicker({ value, onChange, C=T }) {
  const moods  = ['😔','😐','🙂','😊','🤩']
  const labels = ['Berat','Biasa','Oke','Baik','Luar Biasa']
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
      {moods.map((m,i) => (
        <div key={m} onClick={()=>onChange(i)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer' }}>
          <div style={{ fontSize:28, opacity:value===i?1:0.35, transition:'all 0.2s', transform:value===i?'scale(1.2)':'scale(1)' }}>{m}</div>
          <div style={{ fontSize:8, color:value===i?C.teal:C.muted, fontWeight:value===i?700:400 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  )
}

export function Toast({ toast }) {
  if (!toast) return null
  const configs = {
    success: { bg:T.teal,   icon:'✅' },
    error:   { bg:T.red,    icon:'❌' },
    info:    { bg:T.amber,  icon:'💡' },
    warning: { bg:T.orange, icon:'⚠️' },
  }
  const c = configs[toast.type] || configs.success
  return (
    <div style={{ position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', zIndex:9999, background:c.bg, color:'#fff', borderRadius:14, padding:'11px 20px', fontSize:13, fontWeight:600, boxShadow:'0 6px 24px rgba(0,0,0,0.2)', animation:'slideDown 0.3s ease', whiteSpace:'nowrap', maxWidth:'90vw', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {c.icon} {toast.message}
    </div>
  )
}

export function BottomNav({ page, navigate, darkMode }) {
  const C = useTokens(darkMode)
  const items = [
    { key:'timer',   icon:'⏱', label:'Timer'    },
    { key:'journal', icon:'📓', label:'Jurnal'   },
    { key:'stats',   icon:'📊', label:'Statistik'},
    { key:'ai',      icon:'🤖', label:'AI'       },
    { key:'settings',icon:'⚙️', label:'Setelan' },
  ]
  return (
    <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, background: darkMode?'rgba(18,17,14,0.97)':'rgba(253,250,245,0.97)', backdropFilter:'blur(16px)', borderTop:`1px solid ${C.line}`, display:'flex', justifyContent:'space-around', padding:'9px 0 18px', zIndex:50, transition:'background 0.3s' }}>
      {items.map(n => (
        <div key={n.key} onClick={()=>navigate(n.key)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', opacity:page===n.key?1:0.38, transition:'opacity 0.2s' }}>
          <div style={{ fontSize:19 }}>{n.icon}</div>
          <div style={{ fontSize:7, fontWeight:page===n.key?700:500, letterSpacing:1, textTransform:'uppercase', color:page===n.key?C.teal:C.muted }}>{n.label}</div>
          {page===n.key && <div style={{ width:4, height:4, borderRadius:'50%', background:C.teal }}/>}
        </div>
      ))}
    </div>
  )
}
