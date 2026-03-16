// ── SOUND ENGINE — Web Audio API (no external files needed) ──
// Semua suara dibuat secara programatik, tidak butuh file mp3

let ctx = null

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

const playTone = (freq, duration, type = 'sine', vol = 0.4, delay = 0) => {
  try {
    const c = getCtx()
    const osc  = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime + delay)
    gain.gain.setValueAtTime(0, c.currentTime + delay)
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration + 0.05)
  } catch(e) { console.log('Audio error:', e) }
}

// 🎵 Sesi fokus selesai — chord naik yang menyenangkan
export const playSessionComplete = () => {
  playTone(523,  0.15, 'sine', 0.35, 0.00)   // C5
  playTone(659,  0.15, 'sine', 0.35, 0.18)   // E5
  playTone(784,  0.15, 'sine', 0.35, 0.36)   // G5
  playTone(1047, 0.50, 'sine', 0.28, 0.54)   // C6 sustained
}

// 🔔 Istirahat selesai — 2 nada pendek turun
export const playBreakComplete = () => {
  playTone(880, 0.10, 'sine', 0.28, 0.00)
  playTone(660, 0.35, 'sine', 0.28, 0.14)
}

// ⏱ Tick 5 detik terakhir
export const playTick = () => {
  playTone(1400, 0.04, 'square', 0.06)
}

// ▶️ Start timer
export const playStart = () => {
  playTone(440, 0.08, 'sine', 0.18, 0.00)
  playTone(554, 0.18, 'sine', 0.18, 0.08)
}

// ⏸ Pause timer
export const playPause = () => {
  playTone(554, 0.08, 'sine', 0.14, 0.00)
  playTone(440, 0.18, 'sine', 0.14, 0.08)
}

// 📳 Vibrate helper
export const vibrate = (pattern) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern) } catch {}
}

// Resume AudioContext after user gesture
export const resumeAudio = () => {
  try { if (ctx?.state === 'suspended') ctx.resume() } catch {}
}
