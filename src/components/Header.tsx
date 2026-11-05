import React from 'react';
import { BookOpen, Calendar, Clock, CheckSquare, Sun, Moon, Bell, BellRing } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  urgentTaskCount: number;
  openNotificationSettings: () => void;
  notificationPermission: NotificationPermission;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  urgentTaskCount,
  openNotificationSettings,
  notificationPermission,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white hover:opacity-85 transition-opacity whitespace-nowrap cursor-pointer"
            >
              JadwalKu
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single line, 1-2 words) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'jadwal'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Jadwal Pelajaran
            </button>
            <button
              onClick={() => setActiveTab('tugas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tugas'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Daftar Tugas</span>
              {urgentTaskCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" title={`${urgentTaskCount} tugas mendekati deadline`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('kalender')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'kalender'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Integrasi Kalender
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pomodoro'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timer Belajar</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openNotificationSettings}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                notificationPermission === 'granted'
                  ? 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  : 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200 hover:bg-amber-100'
              }`}
              title="Pengaturan Notifikasi & Alarm"
            >
              {notificationPermission === 'granted' ? (
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
              )}
              <span className="hidden sm:inline">
                {notificationPermission === 'granted' ? 'Notifikasi Aktif' : 'Aktifkan Alarm'}
              </span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Ganti Tema Tampilan"
              title={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-neutral-100 dark:border-neutral-800/60 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-500'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'jadwal'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-500'
            }`}
          >
            Jadwal
          </button>
          <button
            onClick={() => setActiveTab('tugas')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap relative ${
              activeTab === 'tugas'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-500'
            }`}
          >
            Tugas
            {urgentTaskCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('kalender')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'kalender'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-500'
            }`}
          >
            Kalender
          </button>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'pomodoro'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-500'
            }`}
          >
            Fokus
          </button>
        </div>
      </div>
    </header>
  );
};
