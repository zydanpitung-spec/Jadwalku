import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { playAlertChime } from '../utils/notifications';

interface PomodoroTimerProps {
  tasks: Task[];
  activeFocusTask: Task | null;
  setActiveFocusTask: (task: Task | null) => void;
  onPomodoroComplete: () => void;
  pomodoroCount: number;
}

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  activeFocusTask,
  setActiveFocusTask,
  onPomodoroComplete,
  pomodoroCount,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playAlertChime('pomodoro');
      if (mode === 'pomodoro') {
        onPomodoroComplete();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, onPomodoroComplete]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const progress = ((MODE_DURATIONS[mode] - timeLeft) / MODE_DURATIONS[mode]) * 100;

  const activeTasks = tasks.filter((t) => !t.isCompleted);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center transition-colors shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
            Metode Pomodoro 25 Menit
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            Timer Belajar & Fokus
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Fokus penuh selama 25 menit tanpa distraksi media sosial untuk menyelesaikan tugas dengan cepat.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Fokus Belajar (25m)
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Istirahat (5m)
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Istirahat Panjang (15m)
          </button>
        </div>

        {/* Pilihan Tugas yang sedang dikerjakan */}
        <div className="max-w-md mx-auto">
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 text-left">
            Tugas yang Sedang Dikerjakan:
          </label>
          <select
            value={activeFocusTask?.id || ''}
            onChange={(e) => {
              const selected = tasks.find((t) => t.id === e.target.value) || null;
              setActiveFocusTask(selected);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">-- Belajar Umum / Mengulang Materi --</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.subject}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Clock Digits Display (Strict font-mono tabular-nums) */}
        <div className="py-6">
          <div className="text-6xl sm:text-7xl font-bold font-mono tabular-nums tracking-tight text-neutral-900 dark:text-white select-none">
            {pad(minutes)}:{pad(seconds)}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Fokus</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Reset Waktu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Sesi Belajar Hari Ini */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            Total Selesai Hari Ini:{' '}
            <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
              {pomodoroCount}
            </span>{' '}
            Sesi (~{pomodoroCount * 25} Menit)
          </div>
        </div>
      </div>

      {/* Tips Belajar Efektif */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Tips Belajar Fokus & Produktif Siswa</span>
        </h3>
        <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2 list-disc pl-4 leading-relaxed">
          <li>Singkirkan HP atau nyalakan mode "Jangan Ganggu" selama 25 menit.</li>
          <li>Siapkan air minum dan alat tulis di meja sebelum menekan tombol Mulai.</li>
          <li>Gunakan waktu istirahat 5 menit untuk berdiri, meregangkan tubuh, atau minum air, bukan membuka TikTok/media sosial.</li>
          <li>Setelah 4 sesi pomodoro berturut-turut, ambil istirahat panjang 15-20 menit.</li>
        </ul>
      </div>
    </div>
  );
};
