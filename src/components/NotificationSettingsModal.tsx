import React from 'react';
import { X, Bell, Volume2, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { playAlertChime, requestNotificationPermission, sendBrowserNotification } from '../utils/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationPermission: NotificationPermission;
  onPermissionChange: (perm: NotificationPermission) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  notificationPermission,
  onPermissionChange,
}) => {
  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    onPermissionChange(res);
    if (res === 'granted') {
      sendBrowserNotification('Notifikasi JadwalKu Aktif!', {
        body: 'Pengingat deadline tugas & jadwal pelajaran Anda kini aktif.',
      });
    }
  };

  const handleTestChime = () => {
    playAlertChime('reminder');
  };

  const handleTestNotification = () => {
    sendBrowserNotification('Pengingat Contoh: Ujian Matematika', {
      body: 'Batas pengumpulan tugas tersisa 1 jam lagi!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-xl transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Pengaturan Pengingat & Alarm
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {/* Status Izin Notifikasi Browser */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                Izin Notifikasi Browser
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {notificationPermission === 'granted' ? 'Diizinkan' : 'Belum Aktif'}
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Dengan mengizinkan notifikasi, browser Anda akan memunculkan alarm saat tugas mendekati batas waktu (deadline).
            </p>

            {notificationPermission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Aktifkan Izin Notifikasi</span>
              </button>
            ) : (
              <button
                onClick={handleTestNotification}
                className="w-full py-2 px-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Kirim Notifikasi Uji Coba</span>
              </button>
            )}
          </div>

          {/* Uji Coba Bunyi Bel Audio */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Alarm Suara (Web Audio Chime)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Bunyi bel lembut yang berbunyi ketika timer Pomodoro selesai atau alarm pengingat tugas berbunyi.
            </p>
            <button
              onClick={handleTestChime}
              className="py-1.5 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Putar Contoh Bunyi Alarm
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
