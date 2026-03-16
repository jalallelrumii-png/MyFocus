import { create } from 'zustand'

// ── HELPERS ─────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── STORE ────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Navigation ──────────────────────────────────────────
  page: 'timer',   // timer | journal | stats | ai

  // ── Timer State ──────────────────────────────────────────
  mode: 'pomodoro',        // pomodoro | deepwork | break
  timerRunning: false,
  secondsLeft: 25 * 60,
  totalSeconds: 25 * 60,
  currentTask: '',
  sessionCount: load('sessionCount_' + today(), 0),
  totalFocusMinutes: load('totalFocus_' + today(), 0),
  streak: load('streak', 0),
  lastActiveDate: load('lastActiveDate', ''),

  // ── Deep Work custom duration ─────────────────────────────
  deepWorkMinutes: 50,

  // ── Sessions log ─────────────────────────────────────────
  sessions: load('sessions_' + today(), []),   // [{task, duration, mode, time}]

  // ── Journal ──────────────────────────────────────────────
  journals: load('journals', {}),   // { 'YYYY-MM-DD': { morning, evening, mood } }

  // ── Toast ─────────────────────────────────────────────────
  toast: null,

  // ── Timer interval ref ────────────────────────────────────
  _intervalId: null,

  // ── ACTIONS ───────────────────────────────────────────────

  navigate: (page) => set({ page }),

  setMode: (mode) => {
    const { timerRunning, stopTimer } = get()
    if (timerRunning) stopTimer()
    const secs = mode === 'pomodoro' ? 25*60 : mode === 'break' ? 5*60 : get().deepWorkMinutes*60
    set({ mode, secondsLeft: secs, totalSeconds: secs })
  },

  setDeepWorkMinutes: (m) => {
    set({ deepWorkMinutes: m, secondsLeft: m*60, totalSeconds: m*60 })
  },

  setCurrentTask: (t) => set({ currentTask: t }),

  startTimer: () => {
    const { secondsLeft, _intervalId } = get()
    if (secondsLeft <= 0) return
    if (_intervalId) clearInterval(_intervalId)

    const id = setInterval(() => {
      const { secondsLeft, timerRunning } = get()
      if (!timerRunning) { clearInterval(id); return }
      if (secondsLeft <= 1) {
        clearInterval(id)
        get().completeSession()
      } else {
        set({ secondsLeft: secondsLeft - 1 })
      }
    }, 1000)

    set({ timerRunning: true, _intervalId: id })
  },

  pauseTimer: () => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    set({ timerRunning: false, _intervalId: null })
  },

  stopTimer: () => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    const { mode, deepWorkMinutes } = get()
    const secs = mode === 'pomodoro' ? 25*60 : mode === 'break' ? 5*60 : deepWorkMinutes*60
    set({ timerRunning: false, _intervalId: null, secondsLeft: secs })
  },

  completeSession: () => {
    const { mode, currentTask, totalSeconds, sessionCount, totalFocusMinutes, sessions, streak, lastActiveDate } = get()
    if (mode === 'break') {
      get().showToast('Istirahat selesai! Siap fokus lagi? 💪', 'success')
      set({ secondsLeft: 25*60, totalSeconds: 25*60, mode: 'pomodoro', timerRunning: false })
      return
    }

    const durationMins = Math.round(totalSeconds / 60)
    const newSession = {
      task: currentTask || 'Sesi fokus',
      duration: durationMins,
      mode,
      time: new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
      timestamp: Date.now()
    }

    const newCount    = sessionCount + 1
    const newFocus    = totalFocusMinutes + durationMins
    const newSessions = [...sessions, newSession]

    // streak logic
    const todayStr = today()
    let newStreak = streak
    if (lastActiveDate !== todayStr) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1)
      const yStr = yesterday.toISOString().split('T')[0]
      newStreak = lastActiveDate === yStr ? streak + 1 : 1
    }

    save('sessionCount_' + todayStr, newCount)
    save('totalFocus_' + todayStr, newFocus)
    save('sessions_' + todayStr, newSessions)
    save('streak', newStreak)
    save('lastActiveDate', todayStr)

    const secs = mode === 'pomodoro' ? 25*60 : get().deepWorkMinutes*60
    set({
      sessionCount: newCount,
      totalFocusMinutes: newFocus,
      sessions: newSessions,
      streak: newStreak,
      lastActiveDate: todayStr,
      timerRunning: false,
      _intervalId: null,
      secondsLeft: secs,
    })

    get().showToast(`Sesi selesai! +${durationMins} menit fokus 🎉`, 'success')
    // Auto-suggest break after pomodoro
    if (mode === 'pomodoro' && newCount % 4 === 0) {
      setTimeout(() => get().showToast('4 sesi selesai! Istirahat panjang dulu 😌', 'info'), 2000)
    }
  },

  resetTimer: () => {
    const { _intervalId, mode, deepWorkMinutes } = get()
    if (_intervalId) clearInterval(_intervalId)
    const secs = mode === 'pomodoro' ? 25*60 : mode === 'break' ? 5*60 : deepWorkMinutes*60
    set({ timerRunning: false, _intervalId: null, secondsLeft: secs, totalSeconds: secs })
  },

  // ── Journal ───────────────────────────────────────────────
  saveJournal: (date, data) => {
    const { journals } = get()
    const updated = { ...journals, [date]: { ...journals[date], ...data } }
    save('journals', updated)
    set({ journals: updated })
    get().showToast('Jurnal tersimpan ✅')
  },

  getJournal: (date) => get().journals[date] || { morning: '', evening: '', mood: '' },

  // ── Stats helpers ─────────────────────────────────────────
  getWeekStats: () => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const ds = d.toISOString().split('T')[0]
      const mins = load('totalFocus_' + ds, 0)
      const sessions = load('sessionCount_' + ds, 0)
      result.push({ date: ds, day: d.toLocaleDateString('id-ID',{weekday:'short'}), mins, sessions })
    }
    return result
  },

  // ── Toast ─────────────────────────────────────────────────
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },

}))
