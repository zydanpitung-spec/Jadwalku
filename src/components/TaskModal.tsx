import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, Bell, BookOpen, FileText } from 'lucide-react';
import { Task, TaskPriority, TaskType } from '../types';
import { COMMON_SUBJECTS } from '../data/initialData';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  initialData?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Matematika Wajib');
  const [type, setType] = useState<TaskType>('tugas');
  const [priority, setPriority] = useState<TaskPriority>('sedang');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [description, setDescription] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(60);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSubject(initialData.subject);
      setType(initialData.type);
      setPriority(initialData.priority);
      setDueDate(initialData.dueDate);
      setDueTime(initialData.dueTime || '23:59');
      setDescription(initialData.description || '');
      setReminderEnabled(initialData.reminderEnabled ?? true);
      setReminderMinutesBefore(initialData.reminderMinutesBefore ?? 60);
    } else {
      // Default besok
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pad = (n: number) => String(n).padStart(2, '0');
      const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

      setTitle('');
      setSubject('Matematika');
      setType('tugas');
      setPriority('sedang');
      setDueDate(tomorrowStr);
      setDueTime('21:00');
      setDescription('');
      setReminderEnabled(true);
      setReminderMinutesBefore(60);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onSave({
      id: initialData?.id,
      title: title.trim(),
      subject: subject.trim(),
      type,
      priority,
      dueDate,
      dueTime: dueTime || '23:59',
      description: description.trim(),
      isCompleted: initialData?.isCompleted || false,
      completedAt: initialData?.completedAt,
      reminderEnabled,
      reminderMinutesBefore,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {initialData ? 'Edit Tugas & Pengingat' : 'Tambah Tugas & Pengingat Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Judul Tugas / Deadline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Latihan Soal Bab 3, Makalah Sejarah..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Mata Pelajaran & Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Mata Pelajaran
              </label>
              <input
                type="text"
                list="subjects-list"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Pilih atau ketik mapel"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="subjects-list">
                {COMMON_SUBJECTS.map((s) => (
                  <option key={s.name} value={s.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tipe Tugas
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pr">PR (Pekerjaan Rumah)</option>
                <option value="tugas">Tugas Mandiri</option>
                <option value="ujian">Ujian / Ulangan / Kuis</option>
                <option value="proyek">Proyek Kelompok</option>
                <option value="praktikum">Laporan Praktikum</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Waktu Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Batas Tanggal (Deadline) *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Jam Pengumpulan
              </label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Prioritas */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tingkat Prioritas
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('tinggi')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                  priority === 'tinggi'
                    ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                Tinggi / Penting
              </button>
              <button
                type="button"
                onClick={() => setPriority('sedang')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                  priority === 'sedang'
                    ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                Sedang (Biasa)
              </button>
              <button
                type="button"
                onClick={() => setPriority('rendah')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                  priority === 'rendah'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                Rendah (Santai)
              </button>
            </div>
          </div>

          {/* Pengingat & Reminder Toggle */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Pengingat / Alarm Tugas
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-700/60">
                <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                  Ingatkan Saya Sebelum Deadline:
                </label>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono tabular-nums"
                >
                  <option value={15}>15 menit sebelum deadline</option>
                  <option value={30}>30 menit sebelum deadline</option>
                  <option value={60}>1 jam sebelum deadline</option>
                  <option value={120}>2 jam sebelum deadline</option>
                  <option value={1440}>1 hari (24 jam) sebelum deadline</option>
                </select>
              </div>
            )}
          </div>

          {/* Deskripsi & Panduan Tugas */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Deskripsi / Petunjuk Pengumpulan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Format PDF 3 halaman, kumpul di Google Classroom, kerjakan nomor genap..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Tombol */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {initialData ? 'Perbarui Tugas' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
