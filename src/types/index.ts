export type DayOfWeek = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export type SubjectColor = 
  | 'blue' 
  | 'emerald' 
  | 'indigo' 
  | 'amber' 
  | 'rose' 
  | 'purple' 
  | 'cyan' 
  | 'orange';

export interface ClassScheduleItem {
  id: string;
  day: DayOfWeek;
  subject: string;
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "09:00"
  room: string;
  teacher: string;
  color: SubjectColor;
  notes?: string;
}

export type TaskPriority = 'tinggi' | 'sedang' | 'rendah';
export type TaskType = 'pr' | 'tugas' | 'ujian' | 'proyek' | 'praktikum' | 'lainnya';

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number; // 15, 60, 1440 (1 day)
  createdAt: string;
}

export type ActiveTab = 'overview' | 'jadwal' | 'tugas' | 'kalender' | 'pomodoro';

export interface CalendarDayEvent {
  type: 'schedule' | 'task';
  id: string;
  title: string;
  subtitle: string;
  time: string;
  color: SubjectColor;
  isCompleted?: boolean;
  priority?: TaskPriority;
  rawDate: string;
}
