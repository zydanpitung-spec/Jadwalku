/**
 * Utilitas Notifikasi Audio & Browser untuk Siswa
 */

// Membunyikan chime menggunakan Web Audio API tanpa file eksternal
export function playAlertChime(type: 'reminder' | 'success' | 'pomodoro' = 'reminder') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'success') {
      // Pleasant double bell chime (C5 -> G5)
      const now = ctx.currentTime;
      [
        { freq: 523.25, time: now, dur: 0.2 },
        { freq: 783.99, time: now + 0.12, dur: 0.35 },
      ].forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      });
    } else if (type === 'pomodoro') {
      // 3 gentle rings
      const now = ctx.currentTime;
      [587.33, 659.25, 880.00].forEach((freq, idx) => {
        const time = now + idx * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
      });
    } else {
      // Standard reminder alert (F5 -> A5)
      const now = ctx.currentTime;
      [
        { freq: 698.46, time: now, dur: 0.18 },
        { freq: 880.00, time: now + 0.1, dur: 0.3 },
      ].forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Meminta izin notifikasi browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Menampilkan notifikasi browser
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      playAlertChime('reminder');
    } catch (e) {
      console.warn('Gagal memicu browser notification:', e);
    }
  }
}
