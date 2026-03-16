// ── FOKUSKU NOTIFICATION SCHEDULER ──────────────────────────
// Manages semua jadwal notifikasi terjadwal

// ── Register Service Worker ───────────────────────────────────
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log('SW registered:', reg.scope)
    return reg
  } catch (e) {
    console.log('SW registration failed:', e)
    return null
  }
}

// ── Get SW registration ───────────────────────────────────────
async function getSW() {
  if (!('serviceWorker' in navigator)) return null
  return await navigator.serviceWorker.ready
}

// ── Send message to SW ────────────────────────────────────────
async function sendToSW(data) {
  const reg = await getSW()
  if (!reg?.active) return false
  reg.active.postMessage(data)
  return true
}

// ── Check & request permission ────────────────────────────────
export async function checkNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

// ── Schedule a notification ───────────────────────────────────
export async function scheduleNotif({ id, title, body, delayMs }) {
  const hasPermission = await checkNotifPermission()
  if (!hasPermission) return false
  return await sendToSW({ type:'SCHEDULE_NOTIF', id, title, body, delay: delayMs })
}

// ── Cancel a notification ─────────────────────────────────────
export async function cancelNotif(id) {
  return await sendToSW({ type:'CANCEL_NOTIF', id })
}

// ── Cancel all scheduled notifs ───────────────────────────────
export function cancelAll() {
  const ids = ['morning-reminder','evening-reminder','streak-danger','idle-reminder','journal-reminder']
  ids.forEach(id => cancelNotif(id))
}

// ─────────────────────────────────────────────────────────────
// PRESET NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

// ── Morning reminder (setiap hari jam tertentu) ───────────────
export function scheduleMorningReminder(hourTarget, streak) {
  const now    = new Date()
  const target = new Date()
  target.setHours(hourTarget, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)  // besok
  const delay = target - now

  const msgs = [
    { title:'☀️ Selamat Pagi!', body:`Streak ${streak} hari nih! Mulai sesi pertama sekarang biar tetap on-track.` },
    { title:'🎯 Waktunya Fokus!', body:'Pagi adalah waktu emas. Buka FokusKu dan mulai hari dengan produktif!' },
    { title:'🌱 Hari Baru, Semangat Baru!', body:`${streak} hari streak — jangan putus hari ini! Satu sesi kecil sudah cukup.` },
  ]
  const msg = msgs[new Date().getDay() % msgs.length]

  return scheduleNotif({ id:'morning-reminder', title:msg.title, body:msg.body, delayMs:delay })
}

// ── Evening journal reminder ──────────────────────────────────
export function scheduleEveningReminder(hourTarget) {
  const now    = new Date()
  const target = new Date()
  target.setHours(hourTarget, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const delay = target - now

  return scheduleNotif({
    id: 'evening-reminder',
    title: '📓 Yuk Tulis Jurnal Malam Ini',
    body: 'Refleksi 2 menit sebelum tidur bikin besok lebih fokus. Apa yang kamu capai hari ini?',
    delayMs: delay
  })
}

// ── Streak danger (kalau belum ada sesi sampai jam 8 malam) ───
export function scheduleStreakDanger(streak) {
  if (streak === 0) return
  const now    = new Date()
  const target = new Date()
  target.setHours(20, 0, 0, 0)
  if (target <= now) return  // sudah lewat jam 8

  const delay = target - now
  return scheduleNotif({
    id: 'streak-danger',
    title: `⚠️ Streak ${streak} Hari Hampir Putus!`,
    body: 'Belum ada sesi hari ini. Masih ada waktu — satu Pomodoro 25 menit sudah cukup!',
    delayMs: delay
  })
}

// ── Idle reminder (belum buka app 2 hari) ─────────────────────
export function scheduleIdleReminder(lastActiveDate) {
  if (!lastActiveDate) return
  const last = new Date(lastActiveDate)
  const now  = new Date()
  const diffDays = Math.floor((now - last) / 86400000)
  if (diffDays < 2) return  // masih aktif

  return scheduleNotif({
    id: 'idle-reminder',
    title: '👋 FokusKu Merindukanmu!',
    body: `Sudah ${diffDays} hari tidak fokus. Yuk balik — streak baru bisa dimulai kapan saja!`,
    delayMs: 1000 * 60 * 5  // 5 menit setelah buka app
  })
}

// ── Reschedule all daily reminders ───────────────────────────
export async function rescheduleAll({ morningHour, eveningHour, streak, lastActiveDate }) {
  await scheduleMorningReminder(morningHour, streak)
  await scheduleEveningReminder(eveningHour)
  await scheduleStreakDanger(streak)
  await scheduleIdleReminder(lastActiveDate)
}
