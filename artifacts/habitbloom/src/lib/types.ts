export type HabitStatus = 'complete' | 'skip' | 'miss';

export interface Habit {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // hex or tw color class
  tinyHabit: string;
  identityGoal: string;
  why?: string;
  repeatSchedule: string[]; // e.g., ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  reminderTime?: string; // HH:mm
  createdAt: string; // ISO string
  isArchived: boolean;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitStatus;
  notes?: string;
}

export interface Reflection {
  id: string;
  date: string; // YYYY-MM-DD
  question: string;
  answer: string;
}

export interface AppState {
  hasSeenSplash: boolean;
  theme: 'light' | 'dark';
  remindersEnabled: boolean;
}
