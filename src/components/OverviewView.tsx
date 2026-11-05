import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Share2, 
  BookOpen, 
  Timer, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ClassScheduleItem, Task, ActiveTab } from '../types';
import { 
  getCurrentDayOfWeek, 
  DAY_NAMES_ID, 
  MONTH_NAMES_ID, 
  getDeadlineCountdown, 
  createGoogleCalendarUrlForTask, 
  createGoogleCalendarUrlForSchedule 
} from '../utils/calendar';
import { SUBJECT_COLORS } from '../data/initialData';

interface OverviewViewProps {
  schedules: ClassScheduleItem[];
  tasks: Task[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddTask: () => void;
  onOpenAddSchedule: () => void;
  onToggleTask: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onOpenCalendarExport: () => void;
  pomodoroCompletedToday: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  schedules,
  tasks,
  setActiveTab,
  onOpenAddTask,
  onOpenAddSchedule,
  onToggleTask,
  onStartFocus,
  onOpenCalendarExport,
  pomodoroCompletedToday,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDay = getCurrentDayOfWeek();
  const todaySchedules = schedules
    .filter((s) => s.day === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  // Cari kelas yang sedang berlangsung atau yang berikutnya hari ini
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  let currentClass: ClassScheduleItem | null = null;
  let nextClass: ClassScheduleItem | null = null;

  for (const item of todaySchedules) {
    const [sh, sm] = item.startTime.split(':').map(Number);
    const [eh, em] = item.endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (currentMinutes >= startMins && currentMinutes < endMins) {
      currentClass = item;
      break;
    } else if (currentMinutes < startMins && !nextClass) {
      nextClass = item;
    }
  }

  // Format tanggal Indonesia
  const dayName = DAY_NAMES_ID[todayDay];
  const dateNum = currentTime.getDate();
  const monthName = MONTH_NAMES_ID[currentTime.getMonth()];
  const yearNum = currentTime.getFullYear();
  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Urutkan tugas aktif berdasarkan deadline terdekat
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    const timeA = `${a.dueDate} ${a.dueTime}`;
    const timeB = `${b.dueDate} ${b.dueTime}`;
    return timeA.localeCompare(timeB);
  });

  const urgentTasks = sortedActiveTasks.filter((t) => {
    const countdown = getDeadlineCountdown(t.dueDate, t.dueTime);
    return countdown.isUrgent || countdown.isOverdue;
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome Strip */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{dayName}, {dateNum} {monthName} {yearNum}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">{timeStr} WIB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Halo, Siswa Hebat! Siap Belajar Hari Ini?
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
              Pantau jadwal pelajaran, selesaikan tugas sebelum batas waktu, dan sinkronkan dengan Google Calendar dalam 1 klik.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
            <button
              onClick={onOpenCalendarExport}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              title="Sinkronisasi ke Google Calendar atau Ekspor .ics"
            >
              <Share2 className="w-4 h-4" />
              <span>Integrasi Kalender</span>
            </button>
          </div>
        </div>

        {/* Status Live Pelajaran Saat Ini / Berikutnya */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Status Kelas Saat Ini</div>
              {currentClass ? (
                <div>
                  <div className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {currentClass.subject}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                    {currentClass.startTime} - {currentClass.endTime} · {currentClass.room}
                  </div>
                </div>
              ) : nextClass ? (
                <div>
                  <div className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    Berikutnya: {nextClass.subject}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                    Mulai {nextClass.startTime} · {nextClass.room}
                  </div>
                </div>
              ) : (
                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-0.5">
                  Tidak ada kelas saat ini (Selesai/Istirahat)
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Deadline & Tugas Aktif</div>
              <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                <span className="font-mono tabular-nums">{activeTasks.length}</span> Tugas Tersisa
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {urgentTasks.length > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium font-mono tabular-nums">
                    {urgentTasks.length} mendesak (&lt; 24 jam)
                  </span>
                ) : (
                  <span>Semua deadline aman</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Sesi Fokus Hari Ini</div>
              <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                <span className="font-mono tabular-nums">{pomodoroCompletedToday}</span> Sesi Pomodoro
              </div>
              <button
                onClick={() => setActiveTab('pomodoro')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium mt-0.5"
              >
                Mulai belajar sekarang &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Kolom (Jadwal Pelajaran Hari Ini & Tugas Mendesak) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Jadwal Hari Ini (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Jadwal Pelajaran Hari Ini ({dayName})
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('jadwal')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Hari</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Tidak ada jadwal pelajaran untuk hari {dayName}. Waktunya istirahat atau mengulang materi!
              </p>
              <button
                onClick={onOpenAddSchedule}
                className="px-3.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                + Tambah Jadwal untuk Hari Ini
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedules.map((item) => {
                const colorTheme = SUBJECT_COLORS[item.color] || SUBJECT_COLORS.indigo;
                const gcalUrl = createGoogleCalendarUrlForSchedule(item);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-2 h-10 rounded-full shrink-0 ${colorTheme.dot}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                            {item.subject}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-mono tabular-nums font-medium text-neutral-700 dark:text-neutral-300">
                            {item.startTime} - {item.endTime}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.room}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{item.teacher}</span>
                        </div>
                        {item.notes && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mt-1 truncate">
                            Catatan: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Tambahkan ke Google Calendar (Berulang Mingguan)"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Google Cal</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Pengingat Tugas & Deadline (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Pengingat Tugas & Deadline
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('tugas')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Semua Tugas ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeTasks.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-semibold text-sm text-neutral-900 dark:text-white">Semua Tugas Sudah Beres!</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Luar biasa! Tidak ada tanggungan tugas saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedActiveTasks.slice(0, 4).map((task) => {
                const countdown = getDeadlineCountdown(task.dueDate, task.dueTime);
                const gcalUrl = createGoogleCalendarUrlForTask(task);

                return (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700 flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => onToggleTask(task.id)}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {task.subject}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="text-xs text-neutral-500 capitalize">
                          {task.type}
                        </span>
                      </div>
                      
                      <div className="font-semibold text-sm text-neutral-900 dark:text-white truncate mt-0.5">
                        {task.title}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className={`font-mono tabular-nums font-medium ${
                            countdown.isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : countdown.isUrgent
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {countdown.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
                        <button
                          onClick={() => onStartFocus(task)}
                          className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>Fokus</span>
                        </button>
                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
                          title="Tambahkan tugas ini ke Google Calendar"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>GCal</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
