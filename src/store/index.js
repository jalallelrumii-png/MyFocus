import { create } from 'zustand'
import {
  playSessionComplete, playBreakComplete,
  playTick, playStart, playPause,
  vibrate, resumeAudio
} from '../lib/sound'
import {
  rescheduleAll, cancelAll, checkNotifPermission
} from '../lib/notifications'

// ── HELPERS ──────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── STORE ─────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Navigation ────────────────────────────────────────────
  page: 'onboarding',

  // ── Onboarding ────────────────────────────────────────────
  onboardingDone: load('onboardingDone', false),

  // ── Dark Mode ─────────────────────────────────────────────
  darkMode: load('darkMode', false),

  // ── Sound ─────────────────────────────────────────────────
  soundEnabled: load('soundEnabled', true),

  // ── Notification settings ─────────────────────────────────
  notifEnabled:  load('notifEnabled', false),
  morningHour:   load('morningHour', 7),     // jam reminder pagi
  eveningHour:   load('eveningHour', 21),    // jam reminder jurnal malam
  morningOn:     load('morningOn', true),
  eveningOn:     load('eveningOn', true),
  streakAlertOn: load('streakAlertOn', true),

  // ── Timer State ───────────────────────────────────────────
  mode: 'pomodoro',
  timerRunning: false,
  secondsLeft: 25 * 60,
  totalSeconds: 25 * 60,
  currentTask: '',
  sessionCount: load('sessionCount_' + today(), 0),
  totalFocusMinutes: load('totalFocus_' + today(), 0),
  streak: load('streak', 0),
  lastActiveDate: load('lastActiveDate', ''),
  deepWorkMinutes: 50,

  // ── Sessions & Journal ────────────────────────────────────
  sessions: load('sessions_' + today(), []),
  journals: load('journals', {}),

  // ── Toast ─────────────────────────────────────────────────
  toast: null,
  _intervalId: null,

  // ══ ACTIONS ════════════════════════════════════════════════

  // ── Onboarding ────────────────────────────────────────────
  completeOnboarding: (name) => {
    save('onboardingDone', true)
    if (name) save('userName', name)
    set({ onboardingDone: true, page: 'timer', userName: name || '' })
    // Schedule notifications after onboarding
    const { morningHour, eveningHour, streak, lastActiveDate } = get()
    rescheduleAll({ morningHour, eveningHour, streak, lastActiveDate }).catch(() => {})
  },

  // ── Dark Mode ─────────────────────────────────────────────
  toggleDarkMode: () => {
    const next = !get().darkMode
    save('darkMode', next)
    set({ darkMode: next })
  },

  // ── Sound ─────────────────────────────────────────────────
  toggleSound: () => {
    const next = !get().soundEnabled
    save('soundEnabled', next)
    set({ soundEnabled: next })
    resumeAudio()
  },

  // ── Notification permission & scheduling ──────────────────
  requestNotif: async () => {
    if (!('Notification' in window)) return false
    const granted = await checkNotifPermission()
    save('notifEnabled', granted)
    set({ notifEnabled: granted })
    if (granted) {
      const { morningHour, eveningHour, streak, lastActiveDate } = get()
      await rescheduleAll({ morningHour, eveningHour, streak, lastActiveDate })
    }
    return granted
  },

  setMorningHour: async (h) => {
    save('morningHour', h)
    set({ morningHour: h })
    if (get().notifEnabled && get().morningOn) {
      const { eveningHour, streak, lastActiveDate } = get()
      await rescheduleAll({ morningHour: h, eveningHour, streak, lastActiveDate })
    }
  },

  setEveningHour: async (h) => {
    save('eveningHour', h)
    set({ eveningHour: h })
    if (get().notifEnabled && get().eveningOn) {
      const { morningHour, streak, lastActiveDate } = get()
      await rescheduleAll({ morningHour, eveningHour: h, streak, lastActiveDate })
    }
  },

  toggleMorningOn: async () => {
    const next = !get().morningOn
    save('morningOn', next)
    set({ morningOn: next })
    if (!next) cancelAll()
    else if (get().notifEnabled) {
      const { morningHour, eveningHour, streak, lastActiveDate } = get()
      await rescheduleAll({ morningHour, eveningHour, streak, lastActiveDate })
    }
  },

  toggleEveningOn: async () => {
    const next = !get().eveningOn
    save('eveningOn', next)
    set({ eveningOn: next })
  },

  toggleStreakAlert: async () => {
    const next = !get().streakAlertOn
    save('streakAlertOn', next)
    set({ streakAlertOn: next })
  },

  sendNotif: (title, body) => {
    if (!get().notifEnabled) return
    try { new Notification(title, { body, icon: '/icons/icon-192.png' }) } catch {}
  },

  // ── Navigation ────────────────────────────────────────────
  navigate: (page) => set({ page }),

  // ── Timer ─────────────────────────────────────────────────
  setMode: (mode) => {
    const { timerRunning, stopTimer } = get()
    if (timerRunning) stopTimer()
    const secs = mode === 'pomodoro' ? 25*60 : mode === 'break' ? 5*60 : get().deepWorkMinutes*60
    set({ mode, secondsLeft: secs, totalSeconds: secs })
  },

  setDeepWorkMinutes: (m) => set({ deepWorkMinutes: m, secondsLeft: m*60, totalSeconds: m*60 }),
  setCurrentTask: (t) => set({ currentTask: t }),

  startTimer: () => {
    const { secondsLeft, _intervalId, soundEnabled } = get()
    if (secondsLeft <= 0) return
    if (_intervalId) clearInterval(_intervalId)
    resumeAudio()
    if (soundEnabled) playStart()
    vibrate([50])

    const id = setInterval(() => {
      const s = get()
      if (!s.timerRunning) { clearInterval(id); return }
      if (s.secondsLeft <= 5 && s.secondsLeft > 1 && s.soundEnabled) playTick()
      if (s.secondsLeft <= 1) {
        clearInterval(id)
        get().completeSession()
      } else {
        set({ secondsLeft: s.secondsLeft - 1 })
      }
    }, 1000)

    set({ timerRunning: true, _intervalId: id })
  },

  pauseTimer: () => {
    const { _intervalId, soundEnabled } = get()
    if (_intervalId) clearInterval(_intervalId)
    if (soundEnabled) playPause()
    vibrate([30])
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
    const {
      mode, currentTask, totalSeconds,
      sessionCount, totalFocusMinutes, sessions,
      streak, lastActiveDate, soundEnabled,
    } = get()

    if (mode === 'break') {
      if (soundEnabled) playBreakComplete()
      vibrate([100, 50, 100])
      get().sendNotif('Istirahat Selesai! ☕', 'Siap fokus lagi? Ayo mulai sesi berikutnya!')
      get().showToast('Istirahat selesai! Siap fokus lagi? 💪', 'success')
      set({ secondsLeft:25*60, totalSeconds:25*60, mode:'pomodoro', timerRunning:false, _intervalId:null })
      return
    }

    if (soundEnabled) playSessionComplete()
    vibrate([200, 100, 200, 100, 400])

    const durationMins = Math.round(totalSeconds / 60)
    const newSession   = {
      task: currentTask || 'Sesi fokus', duration: durationMins, mode,
      time: new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
      timestamp: Date.now()
    }
    const newCount    = sessionCount + 1
    const newFocus    = totalFocusMinutes + durationMins
    const newSessions = [...sessions, newSession]

    const todayStr = today()
    let newStreak = streak
    if (lastActiveDate !== todayStr) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1)
      newStreak = lastActiveDate === yesterday.toISOString().split('T')[0] ? streak + 1 : 1
    }

    save('sessionCount_' + todayStr, newCount)
    save('totalFocus_' + todayStr, newFocus)
    save('sessions_' + todayStr, newSessions)
    save('streak', newStreak)
    save('lastActiveDate', todayStr)

    const secs = mode === 'pomodoro' ? 25*60 : get().deepWorkMinutes*60
    set({
      sessionCount:newCount, totalFocusMinutes:newFocus,
      sessions:newSessions, streak:newStreak,
      lastActiveDate:todayStr, timerRunning:false,
      _intervalId:null, secondsLeft:secs,
    })

    get().sendNotif('Sesi Selesai! 🎉', `+${durationMins} menit fokus. Total: ${newFocus} menit.`)
    get().showToast(`Sesi selesai! +${durationMins} menit fokus 🎉`, 'success')
    if (mode === 'pomodoro' && newCount % 4 === 0) {
      setTimeout(() => get().showToast('4 sesi! Istirahat panjang dulu 😌', 'info'), 2500)
    }

    // Reschedule streak danger after each session
    const { morningHour, eveningHour } = get()
    rescheduleAll({ morningHour, eveningHour, streak:newStreak, lastActiveDate:todayStr }).catch(()=>{})
  },

  resetTimer: () => {
    const { _intervalId, mode, deepWorkMinutes } = get()
    if (_intervalId) clearInterval(_intervalId)
    const secs = mode === 'pomodoro' ? 25*60 : mode === 'break' ? 5*60 : deepWorkMinutes*60
    set({ timerRunning:false, _intervalId:null, secondsLeft:secs, totalSeconds:secs })
  },

  // ── Journal ───────────────────────────────────────────────
  saveJournal: (date, data) => {
    const { journals } = get()
    const updated = { ...journals, [date]: { ...journals[date], ...data } }
    save('journals', updated)
    set({ journals: updated })
    get().showToast('Jurnal tersimpan ✅')
  },

  getJournal: (date) => get().journals[date] || { morning:'', evening:'', mood:-1 },

  // ── Week stats ────────────────────────────────────────────
  getWeekStats: () => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const ds = d.toISOString().split('T')[0]
      result.push({
        date: ds,
        day: d.toLocaleDateString('id-ID', { weekday:'short' }),
        mins: load('totalFocus_' + ds, 0),
        sessions: load('sessionCount_' + ds, 0),
      })
    }
    return result
  },

  // ── Toast ─────────────────────────────────────────────────
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast:null }), 3500)
  },

  userName: load('userName', ''),
}))
