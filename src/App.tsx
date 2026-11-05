import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { ScheduleView } from './components/ScheduleView';
import { ScheduleModal } from './components/ScheduleModal';
import { TasksView } from './components/TasksView';
import { TaskModal } from './components/TaskModal';
import { CalendarView } from './components/CalendarView';
import { CalendarExportModal } from './components/CalendarExportModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';

import { ClassScheduleItem, Task, ActiveTab, DayOfWeek } from './types';
import { INITIAL_SCHEDULE, INITIAL_TASKS } from './data/initialData';
import { getCurrentDayOfWeek, getDeadlineCountdown } from './utils/calendar';
import { playAlertChime, sendBrowserNotification } from './utils/notifications';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('jadwalku_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jadwalku_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jadwalku_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Schedules state with localStorage
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('jadwalku_schedules');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  useEffect(() => {
    localStorage.setItem('jadwalku_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Tasks state with localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('jadwalku_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('jadwalku_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Tab & Day selection
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getCurrentDayOfWeek());

  // Pomodoro state
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jadwalku_pomodoro_count');
      return saved ? Number(saved) : 2;
    } catch {
      return 2;
    }
  });

  useEffect(() => {
    localStorage.setItem('jadwalku_pomodoro_count', String(pomodoroCount));
  }, [pomodoroCount]);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ClassScheduleItem | null>(null);
  const [scheduleModalDefaultDay, setScheduleModalDefaultDay] = useState<DayOfWeek>('senin');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskItem, setEditingTaskItem] = useState<Task | null>(null);

  const [isCalendarExportModalOpen, setIsCalendarExportModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Notification permissions
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  // Track notified task IDs to prevent spamming
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // Background reminder checker interval (every 60s)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((task) => {
        if (task.isCompleted || !task.reminderEnabled) return;
        if (notifiedTasksRef.current.has(task.id)) return;

        try {
          const [year, month, day] = task.dueDate.split('-').map(Number);
          const [hour, min] = (task.dueTime || '23:59').split(':').map(Number);
          const target = new Date(year, month - 1, day, hour, min);
          const diffMinutes = Math.floor((target.getTime() - now.getTime()) / (1000 * 60));
          const threshold = task.reminderMinutesBefore || 60;

          // If within threshold and not overdue by more than 15 mins
          if (diffMinutes <= threshold && diffMinutes >= -15) {
            notifiedTasksRef.current.add(task.id);
            sendBrowserNotification(`Pengingat Deadline: ${task.title}`, {
              body: `Mata Pelajaran: ${task.subject}. Sisa waktu sekitar ${Math.max(1, diffMinutes)} menit lagi!`,
            });
          }
        } catch {
          // ignore date parse issues
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Urgent task count for badges
  const urgentTaskCount = tasks.filter((t) => {
    if (t.isCompleted) return false;
    const { isUrgent, isOverdue } = getDeadlineCountdown(t.dueDate, t.dueTime);
    return isUrgent || isOverdue;
  }).length;

  // Handlers for Schedule
  const handleOpenAddSchedule = (day?: DayOfWeek) => {
    setEditingScheduleItem(null);
    setScheduleModalDefaultDay(day || selectedDay);
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (item: ClassScheduleItem) => {
    setEditingScheduleItem(item);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (itemData: Omit<ClassScheduleItem, 'id'> & { id?: string }) => {
    if (itemData.id) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === itemData.id ? ({ ...itemData, id: itemData.id } as ClassScheduleItem) : s))
      );
    } else {
      const newItem: ClassScheduleItem = {
        ...itemData,
        id: `sch-${Date.now()}`,
      };
      setSchedules((prev) => [...prev, newItem]);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Handlers for Task
  const handleOpenAddTask = (defaultDate?: string) => {
    setEditingTaskItem(null);
    if (defaultDate) {
      setEditingTaskItem({
        id: '',
        title: '',
        subject: 'Matematika',
        type: 'tugas',
        priority: 'sedang',
        dueDate: defaultDate,
        dueTime: '21:00',
        isCompleted: false,
        reminderEnabled: true,
        reminderMinutesBefore: 60,
        createdAt: new Date().toISOString(),
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskItem(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? { ...t, ...taskData }
            : t
        )
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeFocusTask?.id === id) {
      setActiveFocusTask(null);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willComplete = !t.isCompleted;
          if (willComplete) {
            playAlertChime('success');
          }
          return {
            ...t,
            isCompleted: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task);
    setActiveTab('pomodoro');
  };

  const handlePomodoroComplete = () => {
    setPomodoroCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        urgentTaskCount={urgentTaskCount}
        openNotificationSettings={() => setIsNotificationModalOpen(true)}
        notificationPermission={notificationPermission}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewView
            schedules={schedules}
            tasks={tasks}
            setActiveTab={setActiveTab}
            onOpenAddTask={() => handleOpenAddTask()}
            onOpenAddSchedule={() => handleOpenAddSchedule()}
            onToggleTask={handleToggleTask}
            onStartFocus={handleStartFocus}
            onOpenCalendarExport={() => setIsCalendarExportModalOpen(true)}
            pomodoroCompletedToday={pomodoroCount}
          />
        )}

        {activeTab === 'jadwal' && (
          <ScheduleView
            schedules={schedules}
            onAddSchedule={() => handleOpenAddSchedule(selectedDay)}
            onEditSchedule={handleEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        )}

        {activeTab === 'tugas' && (
          <TasksView
            tasks={tasks}
            onAddTask={() => handleOpenAddTask()}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onStartFocus={handleStartFocus}
          />
        )}

        {activeTab === 'kalender' && (
          <CalendarView
            tasks={tasks}
            schedules={schedules}
            onAddTaskOnDate={(d) => handleOpenAddTask(d)}
            onToggleTask={handleToggleTask}
            onOpenCalendarExport={() => setIsCalendarExportModalOpen(true)}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroTimer
            tasks={tasks}
            activeFocusTask={activeFocusTask}
            setActiveFocusTask={setActiveFocusTask}
            onPomodoroComplete={handlePomodoroComplete}
            pomodoroCount={pomodoroCount}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">JadwalKu</span>
            <span aria-hidden="true">·</span>
            <span>Planner Jadwal & Pengingat Tugas Siswa</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsCalendarExportModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Ekspor Kalender (.ics)
            </button>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Pengaturan Alarm
            </button>
            <button
              onClick={() => {
                if (confirm('Kembalikan semua jadwal dan tugas ke data contoh awal?')) {
                  localStorage.removeItem('jadwalku_schedules');
                  localStorage.removeItem('jadwalku_tasks');
                  setSchedules(INITIAL_SCHEDULE);
                  setTasks(INITIAL_TASKS);
                }
              }}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              Reset Data Awal
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        initialData={editingScheduleItem}
        defaultDay={scheduleModalDefaultDay}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTaskItem}
      />

      <CalendarExportModal
        isOpen={isCalendarExportModalOpen}
        onClose={() => setIsCalendarExportModalOpen(false)}
        tasks={tasks}
        schedules={schedules}
      />

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationPermission={notificationPermission}
        onPermissionChange={(perm) => setNotificationPermission(perm)}
      />
    </div>
  );
}
