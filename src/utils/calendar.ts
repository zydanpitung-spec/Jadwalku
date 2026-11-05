import { ClassScheduleItem, Task, DayOfWeek } from '../types';

export const DAY_NAMES_ID: Record<DayOfWeek, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
};

export const DAY_ORDER: DayOfWeek[] = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Mendapatkan hari saat ini dalam format DayOfWeek
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const map: Record<number, DayOfWeek> = {
    0: 'minggu',
    1: 'senin',
    2: 'selasa',
    3: 'rabu',
    4: 'kamis',
    5: 'jumat',
    6: 'sabtu',
  };
  return map[dayIndex] || 'senin';
}

/**
 * Format string tanggal YYYY-MM-DD ke format Indonesia (e.g. "Kamis, 5 November 2026")
 */
export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = DAY_NAMES_ID[getCurrentDayOfWeekFromDate(date)];
  const monthName = MONTH_NAMES_ID[month - 1];
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function getCurrentDayOfWeekFromDate(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  const map: Record<number, DayOfWeek> = {
    0: 'minggu',
    1: 'senin',
    2: 'selasa',
    3: 'rabu',
    4: 'kamis',
    5: 'jumat',
    6: 'sabtu',
  };
  return map[dayIndex] || 'senin';
}

/**
 * Hitung selisih waktu deadline dengan waktu saat ini (countdown)
 */
export function getDeadlineCountdown(dueDate: string, dueTime: string = '23:59'): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean; // < 24 jam
} {
  try {
    const [year, month, day] = dueDate.split('-').map(Number);
    const [hour, minute] = dueTime.split(':').map(Number);
    const target = new Date(year, month - 1, day, hour || 23, minute || 59);
    const now = new Date();

    const diffMs = target.getTime() - now.getTime();
    if (diffMs < 0) {
      const pastHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      if (pastHours < 24) {
        return { label: `Terlambat ${pastHours} jam lalu`, isOverdue: true, isUrgent: true };
      }
      const pastDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return { label: `Terlambat ${pastDays} hari lalu`, isOverdue: true, isUrgent: true };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return { label: `Sisa ${diffMins} menit lagi!`, isOverdue: false, isUrgent: true };
    }
    if (diffHours < 24) {
      return { label: `Sisa ${diffHours} jam lagi`, isOverdue: false, isUrgent: true };
    }
    if (diffDays === 1) {
      return { label: `Besok (${dueTime})`, isOverdue: false, isUrgent: true };
    }
    if (diffDays < 7) {
      return { label: `${diffDays} hari lagi`, isOverdue: false, isUrgent: false };
    }
    return { label: `${diffDays} hari lagi`, isOverdue: false, isUrgent: false };
  } catch {
    return { label: dueDate, isOverdue: false, isUrgent: false };
  }
}

/**
 * Format format tanggal untuk URL Google Calendar & ICS: YYYYMMDDTHHmmSSZ
 */
function toGCalDateTime(dateStr: string, timeStr: string, durationMinutes = 60): { start: string; end: string } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, mins] = timeStr.split(':').map(Number);

  const start = new Date(year, month - 1, day, hours, mins, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const format = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  return {
    start: format(start),
    end: format(end),
  };
}

/**
 * 1-Click Google Calendar URL Generator untuk Tugas
 */
export function createGoogleCalendarUrlForTask(task: Task): string {
  const { start, end } = toGCalDateTime(task.dueDate, task.dueTime || '23:59', 30);
  const title = `[Tugas] ${task.title} - ${task.subject}`;
  const details = `Mata Pelajaran: ${task.subject}\nTipe: ${task.type.toUpperCase()}\nPrioritas: ${task.priority.toUpperCase()}\n\nDeskripsi:\n${task.description || 'Tidak ada catatan tambahan.'}\n\nDibuat via JadwalKu Siswa Planner`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
}

/**
 * 1-Click Google Calendar URL Generator untuk Jadwal Pelajaran (berulang mingguan)
 */
export function createGoogleCalendarUrlForSchedule(item: ClassScheduleItem): string {
  // Hitung tanggal terdekat untuk hari item tersebut
  const dayMap: Record<DayOfWeek, number> = {
    minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6,
  };
  const targetDay = dayMap[item.day];
  const now = new Date();
  const currentDay = now.getDay();
  let dayOffset = targetDay - currentDay;
  if (dayOffset < 0) dayOffset += 7;

  const nextDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}`;

  const { start, end } = toGCalDateTime(dateStr, item.startTime, 90);
  const title = `[Kelas] ${item.subject}`;
  const details = `Mata Pelajaran: ${item.subject}\nGuru/Pengajar: ${item.teacher}\nRuangan: ${item.room}\nCatatan: ${item.notes || '-'}\n\nDibuat via JadwalKu Siswa Planner`;
  const location = item.room || 'Sekolah / Kampus';

  // Tambahkan aturan recur mingguan (RRULE:FREQ=WEEKLY)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&recur=RRULE:FREQ=WEEKLY`;
}

/**
 * Generate iCalendar (.ics) RFC 5545 standard file
 */
export function generateIcsFileContent({
  tasks = [],
  schedules = [],
}: {
  tasks?: Task[];
  schedules?: ClassScheduleItem[];
}): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatIcsDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const nowStr = formatIcsDate(new Date());

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JadwalKu//Planner Jadwal Siswa//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:JadwalKu Siswa Planner',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  // Tambahkan tugas
  tasks.forEach((task) => {
    try {
      const [year, month, day] = task.dueDate.split('-').map(Number);
      const [hour, min] = (task.dueTime || '23:59').split(':').map(Number);
      const start = new Date(year, month - 1, day, hour, min);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      ics.push(
        'BEGIN:VEVENT',
        `UID:task-${task.id}@jadwalku.app`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:[Tugas] ${task.title} - ${task.subject}`,
        `DESCRIPTION:Tipe: ${task.type.toUpperCase()}\\nPrioritas: ${task.priority.toUpperCase()}\\nStatus: ${task.isCompleted ? 'Selesai' : 'Belum Selesai'}\\n\\n${(task.description || '').replace(/\n/g, '\\n')}`,
        `STATUS:${task.isCompleted ? 'COMPLETED' : 'CONFIRMED'}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        `DESCRIPTION:Pengingat Tugas: ${task.title}`,
        'END:VALARM',
        'END:VEVENT'
      );
    } catch {
      // skip invalid item
    }
  });

  // Tambahkan jadwal pelajaran berulang
  const dayMap: Record<DayOfWeek, { byday: string; num: number }> = {
    minggu: { byday: 'SU', num: 0 },
    senin: { byday: 'MO', num: 1 },
    selasa: { byday: 'TU', num: 2 },
    rabu: { byday: 'WE', num: 3 },
    kamis: { byday: 'TH', num: 4 },
    jumat: { byday: 'FR', num: 5 },
    sabtu: { byday: 'SA', num: 6 },
  };

  schedules.forEach((item) => {
    try {
      const dayInfo = dayMap[item.day];
      const now = new Date();
      const currentDay = now.getDay();
      let dayOffset = dayInfo.num - currentDay;
      if (dayOffset < 0) dayOffset += 7;

      const [startH, startM] = item.startTime.split(':').map(Number);
      const [endH, endM] = item.endTime.split(':').map(Number);

      const targetDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), startH, startM);
      const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), endH, endM);

      ics.push(
        'BEGIN:VEVENT',
        `UID:schedule-${item.id}@jadwalku.app`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayInfo.byday}`,
        `SUMMARY:[Kelas] ${item.subject}`,
        `LOCATION:${item.room || 'Kelas'}`,
        `DESCRIPTION:Guru/Dosen: ${item.teacher}\\nRuang: ${item.room}\\nCatatan: ${(item.notes || '-').replace(/\n/g, '\\n')}`,
        'END:VEVENT'
      );
    } catch {
      // skip
    }
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Unduh string sebagai file di browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/calendar;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
