import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Timer, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Filter,
  AlertCircle
} from 'lucide-react';
import { Task, TaskPriority, TaskType } from '../types';
import { 
  getDeadlineCountdown, 
  formatDateIndonesian, 
  createGoogleCalendarUrlForTask, 
  generateIcsFileContent, 
  downloadFile 
} from '../utils/calendar';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onStartFocus: (task: Task) => void;
}

type TaskFilter = 'all' | 'active' | 'today' | 'urgent' | 'completed';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  onStartFocus,
}) => {
  const [filter, setFilter] = useState<TaskFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Dapatkan daftar subjek unik untuk dropdown filter
  const subjects = Array.from(new Set(tasks.map((t) => t.subject))).filter(Boolean);

  const todayStr = (() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

  const filteredTasks = tasks.filter((task) => {
    // Filter status tab
    if (filter === 'active' && task.isCompleted) return false;
    if (filter === 'completed' && !task.isCompleted) return false;
    if (filter === 'today' && (task.dueDate !== todayStr || task.isCompleted)) return false;
    if (filter === 'urgent' && (task.priority !== 'tinggi' || task.isCompleted)) return false;

    // Filter subject
    if (selectedSubject !== 'all' && task.subject !== selectedSubject) return false;

    // Filter search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchSub = task.subject.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchDesc) return false;
    }

    return true;
  });

  // Urutkan tugas: belum selesai terlebih dahulu, lalu berdasarkan deadline terdekat
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    const timeA = `${a.dueDate} ${a.dueTime}`;
    const timeB = `${b.dueDate} ${b.dueTime}`;
    return timeA.localeCompare(timeB);
  });

  const handleExportTasksIcs = () => {
    const ics = generateIcsFileContent({ tasks: tasks.filter((t) => !t.isCompleted) });
    downloadFile(ics, 'daftar_tugas_siswa.ics');
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'tinggi':
        return <span className="text-rose-600 dark:text-rose-400 font-semibold">Prioritas Tinggi</span>;
      case 'sedang':
        return <span className="text-amber-600 dark:text-amber-400 font-medium">Prioritas Sedang</span>;
      case 'rendah':
        return <span className="text-neutral-500 font-medium">Prioritas Rendah</span>;
    }
  };

  const getTypeLabel = (t: TaskType) => {
    switch (t) {
      case 'pr': return 'PR Rumah';
      case 'tugas': return 'Tugas Mandiri';
      case 'ujian': return 'Ujian / Kuis';
      case 'proyek': return 'Proyek Tim';
      case 'praktikum': return 'Laporan Praktikum';
      default: return 'Tugas';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Pengingat Tugas & Pekerjaan Rumah
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Kelola tugas, pantau sisa waktu pengerjaan, dan sinkronkan alarm deadline ke Google Calendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportTasksIcs}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download seluruh tugas aktif ke format .ics untuk kalender"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor Tugas .ics</span>
          </button>

          <button
            onClick={onAddTask}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'active'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Aktif ({tasks.filter((t) => !t.isCompleted).length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'today'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Hari Ini ({tasks.filter((t) => t.dueDate === todayStr && !t.isCompleted).length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'urgent'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Prioritas Tinggi
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'completed'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Selesai ({tasks.filter((t) => t.isCompleted).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Semua ({tasks.length})
          </button>
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {subjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Mapel</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Task Cards List */}
      {sortedTasks.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <div className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Tidak ada tugas yang sesuai
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian lain.'
              : filter === 'completed'
              ? 'Belum ada tugas yang diselesaikan.'
              : 'Semua tugas pada filter ini telah selesai atau belum ditambahkan.'}
          </p>
          <button
            onClick={onAddTask}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tugas Baru</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const countdown = getDeadlineCountdown(task.dueDate, task.dueTime);
            const gcalUrl = createGoogleCalendarUrlForTask(task);

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-neutral-900 border rounded-xl p-4.5 transition-all ${
                  task.isCompleted
                    ? 'border-neutral-200/60 dark:border-neutral-800/60 opacity-60 bg-neutral-50/50 dark:bg-neutral-900/40'
                    : countdown.isOverdue
                    ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                } flex flex-col sm:flex-row sm:items-start justify-between gap-4`}
              >
                {/* Checkbox and Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                    title={task.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Unboxed Metadata Line with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                      <span className="font-semibold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                        {task.subject}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{getTypeLabel(task.type)}</span>
                      <span aria-hidden="true">·</span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {/* Judul Tugas */}
                    <h3
                      className={`font-semibold text-base transition-colors ${
                        task.isCompleted
                          ? 'line-through text-neutral-500 dark:text-neutral-400'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Deadline & Countdown */}
                    <div className="flex items-center gap-2 text-xs pt-0.5 flex-wrap">
                      <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{formatDateIndonesian(task.dueDate)}</span>
                      </span>
                      <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="font-mono tabular-nums text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Pukul {task.dueTime}</span>
                      </span>
                      {!task.isCompleted && (
                        <>
                          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                          <span
                            className={`font-mono tabular-nums font-semibold ${
                              countdown.isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : countdown.isUrgent
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {countdown.label}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Deskripsi tugas jika ada */}
                    {task.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 pt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 w-full sm:w-auto justify-end">
                  {!task.isCompleted && (
                    <button
                      onClick={() => onStartFocus(task)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Mulai sesi belajar fokus (Pomodoro) untuk tugas ini"
                    >
                      <Timer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Fokus</span>
                    </button>
                  )}

                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Tambahkan pengingat deadline ini ke Google Calendar"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>GCal</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Edit Tugas"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus tugas "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Hapus Tugas"
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
  );
};
