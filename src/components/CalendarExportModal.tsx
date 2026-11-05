import React, { useState } from 'react';
import { X, Calendar, Download, Check, ExternalLink, HelpCircle, Copy } from 'lucide-react';
import { ClassScheduleItem, Task } from '../types';
import { generateIcsFileContent, downloadFile } from '../utils/calendar';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  schedules: ClassScheduleItem[];
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  schedules,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportOption, setExportOption] = useState<'all' | 'tasks' | 'schedules'>('all');

  if (!isOpen) return null;

  const handleDownloadIcs = () => {
    let icsContent = '';
    let filename = '';

    if (exportOption === 'all') {
      icsContent = generateIcsFileContent({ tasks: tasks.filter((t) => !t.isCompleted), schedules });
      filename = 'jadwalku_lengkap_semua.ics';
    } else if (exportOption === 'tasks') {
      icsContent = generateIcsFileContent({ tasks: tasks.filter((t) => !t.isCompleted) });
      filename = 'jadwalku_tugas_deadline.ics';
    } else {
      icsContent = generateIcsFileContent({ schedules });
      filename = 'jadwalku_jadwal_pelajaran.ics';
    }

    downloadFile(icsContent, filename);
  };

  const handleOpenGoogleCalendarImport = () => {
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Integrasi & Ekspor Kalender
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Hubungkan jadwal ke Google Calendar, Apple Calendar, atau Outlook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 mt-5">
          {/* Opsi Ekspor */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Pilih Konten yang Ingin Diekspor
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <input
                  type="radio"
                  name="exportOpt"
                  checked={exportOption === 'all'}
                  onChange={() => setExportOption('all')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Semua ({schedules.length} Jadwal Mapel + {tasks.filter((t) => !t.isCompleted).length} Tugas Aktif)
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    Paket lengkap jadwal berulang mingguan dan pengingat deadline tugas.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <input
                  type="radio"
                  name="exportOpt"
                  checked={exportOption === 'schedules'}
                  onChange={() => setExportOption('schedules')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Hanya Jadwal Pelajaran Mingguan ({schedules.length} Kelas)
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    Otomatis berulang setiap minggu di kalender ponsel Anda.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <input
                  type="radio"
                  name="exportOpt"
                  checked={exportOption === 'tasks'}
                  onChange={() => setExportOption('tasks')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Hanya Deadline Tugas ({tasks.filter((t) => !t.isCompleted).length} Tugas)
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">
                    Menyimpan tanggal & jam pengumpulan beserta pengingat alarm 1 jam sebelumnya.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Tombol Unduh File .ICS */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Unduh File Standar Kalender (.ics)
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Format universal iCalendar yang didukung 100% oleh Google Calendar, Apple Calendar (iPhone/Mac), Samsung Calendar, dan Microsoft Outlook.
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadIcs}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File .ICS Sekarang</span>
            </button>
          </div>

          {/* Petunjuk Mudah Cara Impor */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Cara Memasukkan File ke Google Calendar:</span>
            </div>
            <ol className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>Klik tombol <strong>"Unduh File .ICS"</strong> di atas.</li>
              <li>
                Buka halaman Impor Google Calendar:{' '}
                <button
                  type="button"
                  onClick={handleOpenGoogleCalendarImport}
                  className="text-indigo-600 dark:text-indigo-400 underline font-medium inline-flex items-center gap-1"
                >
                  <span>Buka Google Calendar Web</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>Pilih file <strong>.ics</strong> yang baru saja diunduh, lalu klik <strong>Impor</strong>.</li>
              <li>Semua jadwal & alarm tugas Anda langsung otomatis tersinkronisasi di HP dan komputer!</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
