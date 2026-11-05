import React, { useState } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Download, 
  Clock, 
  MapPin, 
  User, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Table,
  ListFilter,
  Check
} from 'lucide-react';
import { ClassScheduleItem, DayOfWeek } from '../types';
import { DAY_NAMES_ID, DAY_ORDER, getCurrentDayOfWeek, createGoogleCalendarUrlForSchedule, generateIcsFileContent, downloadFile } from '../utils/calendar';
import { SUBJECT_COLORS } from '../data/initialData';

interface ScheduleViewProps {
  schedules: ClassScheduleItem[];
  onAddSchedule: () => void;
  onEditSchedule: (item: ClassScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  selectedDay: DayOfWeek;
  setSelectedDay: (day: DayOfWeek) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  selectedDay,
  setSelectedDay,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const todayDay = getCurrentDayOfWeek();

  // Filter jadwal sesuai hari yang dipilih
  const currentDaySchedules = schedules
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleDownloadWeeklyIcs = () => {
    const icsContent = generateIcsFileContent({ schedules });
    downloadFile(icsContent, 'jadwal_pelajaran_mingguan.ics');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Jadwal Pelajaran Siswa
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Atur mata pelajaran harian, ruang kelas, guru, dan sinkronkan dengan Google Calendar atau kalender ponsel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switcher Tampilan: Timeline vs Matrix */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Harian</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matriks Mingguan</span>
            </button>
          </div>

          <button
            onClick={handleDownloadWeeklyIcs}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download file .ics untuk diimpor ke Google Calendar / Apple Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor .ics</span>
          </button>

          <button
            onClick={onAddSchedule}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          {/* Day Selector Segmented Control */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {DAY_ORDER.slice(0, 6).map((day) => {
              const isSelected = selectedDay === day;
              const isToday = todayDay === day;
              const count = schedules.filter((s) => s.day === day).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <span>{DAY_NAMES_ID[day]}</span>
                  {isToday && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-sm font-semibold uppercase tracking-wider ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                      }`}
                    >
                      Hari Ini
                    </span>
                  )}
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isSelected ? 'text-white/80' : 'text-neutral-400'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* List Timeline Jadwal Hari Terpilih */}
          {currentDaySchedules.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <div className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                Belum ada jadwal untuk hari {DAY_NAMES_ID[selectedDay]}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Tambahkan mata pelajaran untuk hari ini agar jadwal belajar Anda selalu tertata rapi.
              </p>
              <button
                onClick={onAddSchedule}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jadwal Hari {DAY_NAMES_ID[selectedDay]}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentDaySchedules.map((item, index) => {
                const colorTheme = SUBJECT_COLORS[item.color] || SUBJECT_COLORS.indigo;
                const gcalUrl = createGoogleCalendarUrlForSchedule(item);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4.5 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Baris Jam Mulai & Selesai */}
                      <div className="w-20 text-center shrink-0 pt-0.5">
                        <div className="font-mono tabular-nums font-bold text-sm text-neutral-900 dark:text-white">
                          {item.startTime}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-neutral-400 dark:text-neutral-500">
                          s/d {item.endTime}
                        </div>
                      </div>

                      {/* Line strip color */}
                      <div className={`w-1 self-stretch rounded-full shrink-0 ${colorTheme.dot}`} />

                      {/* Detail Pelajaran */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base text-neutral-900 dark:text-white truncate">
                            {item.subject}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{item.room}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{item.teacher}</span>
                          </span>
                        </div>

                        {item.notes && (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 italic pt-0.5">
                            Catatan: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 w-full sm:w-auto justify-end">
                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Tambahkan ke Google Calendar (Otomatis berulang mingguan)"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Sync Google</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <button
                        onClick={() => onEditSchedule(item)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit Jadwal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus jadwal ${item.subject}?`)) {
                            onDeleteSchedule(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Tampilan Matrix Mingguan (Senin - Sabtu) */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-6 divide-x divide-neutral-200 dark:divide-neutral-800">
              {DAY_ORDER.slice(0, 6).map((day) => {
                const dayItems = schedules
                  .filter((s) => s.day === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                const isToday = todayDay === day;

                return (
                  <div key={day} className="flex flex-col">
                    {/* Header Hari */}
                    <div
                      className={`p-3 text-center border-b border-neutral-200 dark:border-neutral-800 ${
                        isToday ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' : 'bg-neutral-50/50 dark:bg-neutral-800/40'
                      }`}
                    >
                      <div className="font-bold text-xs uppercase tracking-wider">{DAY_NAMES_ID[day]}</div>
                      <div className="text-[11px] text-neutral-500 font-mono tabular-nums mt-0.5">
                        {dayItems.length} Mapel
                      </div>
                    </div>

                    {/* Isi Kartu Mapel */}
                    <div className="p-2 space-y-2 flex-1 min-h-[360px] bg-neutral-50/20 dark:bg-neutral-900/40">
                      {dayItems.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400 text-xs italic">
                          Kosong
                        </div>
                      ) : (
                        dayItems.map((item) => {
                          const colorTheme = SUBJECT_COLORS[item.color] || SUBJECT_COLORS.indigo;
                          return (
                            <div
                              key={item.id}
                              onClick={() => onEditSchedule(item)}
                              className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-1"
                            >
                              <div className="font-mono tabular-nums text-[10px] text-neutral-500 font-medium">
                                {item.startTime} - {item.endTime}
                              </div>
                              <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                                {item.subject}
                              </div>
                              <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${colorTheme.dot}`} />
                                <span className="truncate">{item.room}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
