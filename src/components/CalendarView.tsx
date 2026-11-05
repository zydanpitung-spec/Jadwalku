import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Share2,
  BookOpen,
  Circle
} from 'lucide-react';
import { ClassScheduleItem, Task, DayOfWeek } from '../types';
import { 
  MONTH_NAMES_ID, 
  DAY_NAMES_ID, 
  DAY_ORDER, 
  getCurrentDayOfWeekFromDate, 
  formatDateIndonesian,
  createGoogleCalendarUrlForTask,
  createGoogleCalendarUrlForSchedule
} from '../utils/calendar';
import { SUBJECT_COLORS } from '../data/initialData';

interface CalendarViewProps {
  tasks: Task[];
  schedules: ClassScheduleItem[];
  onAddTaskOnDate: (dateStr: string) => void;
  onToggleTask: (id: string) => void;
  onOpenCalendarExport: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  schedules,
  onAddTaskOnDate,
  onToggleTask,
  onOpenCalendarExport,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format YYYY-MM-DD
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;
  
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Hitung hari pertama bulan ini (0 = Minggu, 1 = Senin, dst)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Ubah indeks agar Senin = 0, Minggu = 6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek < 0) startingDayOfWeek = 6;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  };

  // Parsing selectedDate
  const [selYear, selMonth, selDay] = selectedDateStr.split('-').map(Number);
  const selectedDateObj = new Date(selYear, selMonth - 1, selDay);
  const selectedDayOfWeek = getCurrentDayOfWeekFromDate(selectedDateObj);

  // Jadwal mingguan pada hari terpilih
  const selectedDaySchedules = schedules
    .filter((s) => s.day === selectedDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Tugas pada tanggal terpilih
  const selectedDayTasks = tasks
    .filter((t) => t.dueDate === selectedDateStr)
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime));

  return (
    <div className="space-y-6">
      {/* Header Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Integrasi & Tampilan Kalender
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Lihat agenda pelajaran dan tenggat waktu tugas dalam kalender interaktif bulanan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCalendarExport}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Ekspor / Sinkronkan Kalender</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Grid Kalender Bulanan (8 Kolom) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors space-y-4">
          {/* Navigasi Bulan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {MONTH_NAMES_ID[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Kalender */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            {/* Header Nama Hari */}
            <div className="grid grid-cols-7 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-center py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Sel Tanggal */}
            <div className="grid grid-cols-7 divide-x divide-y divide-neutral-200 dark:divide-neutral-800 bg-neutral-100/30 dark:bg-neutral-900">
              {/* Offset hari kosong di awal bulan */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-20 p-1.5 bg-neutral-50/50 dark:bg-neutral-900/50" />
              ))}

              {/* Tanggal dalam bulan */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const cellDateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
                const isSelected = selectedDateStr === cellDateStr;
                const isToday = todayStr === cellDateStr;

                const cellDateObj = new Date(year, month, dayNum);
                const cellDayOfWeek = getCurrentDayOfWeekFromDate(cellDateObj);

                // Jadwal pada hari ini
                const cellSchedules = schedules.filter((s) => s.day === cellDayOfWeek);
                // Tugas deadline pada tanggal ini
                const cellTasks = tasks.filter((t) => t.dueDate === cellDateStr);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDateStr(cellDateStr)}
                    className={`min-h-20 p-1.5 text-left transition-colors relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500 ring-inset z-10'
                        : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono tabular-nums font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : isSelected
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Indikator Agenda */}
                    <div className="space-y-1 mt-1">
                      {cellTasks.length > 0 && (
                        <div className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-medium truncate">
                          {cellTasks.length} Tugas
                        </div>
                      )}
                      {cellSchedules.length > 0 && (
                        <div className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium truncate">
                          {cellSchedules.length} Kelas
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Hari Terpilih (4 Kolom) */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 transition-colors space-y-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                Agenda Hari Terpilih
              </span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                {formatDateIndonesian(selectedDateStr)}
              </h3>
            </div>
            <button
              onClick={() => onAddTaskOnDate(selectedDateStr)}
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
              title="Tambah tugas pada tanggal ini"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Tugas pada tanggal ini */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Tugas & Deadline ({selectedDayTasks.length})</span>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Tidak ada tugas untuk tanggal ini.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayTasks.map((task) => {
                  const gcalUrl = createGoogleCalendarUrlForTask(task);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="mt-0.5 text-neutral-400 hover:text-indigo-600 cursor-pointer"
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <div
                              className={`text-xs font-semibold ${
                                task.isCompleted
                                  ? 'line-through text-neutral-400'
                                  : 'text-neutral-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                              {task.subject} · Pukul {task.dueTime}
                            </div>
                          </div>
                        </div>

                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-neutral-400 hover:text-indigo-600"
                          title="Buka di Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Kelas Jadwal Pelajaran pada hari ini */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Jadwal Kelas ({DAY_NAMES_ID[selectedDayOfWeek]})
            </div>

            {selectedDaySchedules.length === 0 ? (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Tidak ada kelas pelajaran hari ini.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {selectedDaySchedules.map((item) => {
                  const colorTheme = SUBJECT_COLORS[item.color] || SUBJECT_COLORS.indigo;
                  const gcalUrl = createGoogleCalendarUrlForSchedule(item);

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colorTheme.dot}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                            {item.subject}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono tabular-nums">
                            {item.startTime} - {item.endTime} · {item.room}
                          </div>
                        </div>
                      </div>

                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-indigo-600 p-1"
                        title="Buka di Google Calendar"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
