import { Habit, HabitEntry, Reflection, AppState } from './types';
import { format, subDays, isSameDay } from 'date-fns';

const STORAGE_KEY = 'habitbloom_data';

export interface StorageData {
  habits: Record<string, Habit>;
  entries: Record<string, HabitEntry>;
  reflections: Record<string, Reflection>;
  appState: AppState;
}

const defaultAppState: AppState = {
  hasSeenSplash: false,
  theme: 'light',
  remindersEnabled: false,
};

const defaultData: StorageData = {
  habits: {},
  entries: {},
  reflections: {},
  appState: defaultAppState,
};

// Seed data function
function getSeedData(): StorageData {
  const now = new Date();
  
  const h1: Habit = {
    id: 'seed_1',
    name: 'Read',
    icon: 'BookOpen',
    color: '#84A98C', // Sage
    tinyHabit: 'Read one page',
    identityGoal: 'I am a reader.',
    repeatSchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdAt: subDays(now, 10).toISOString(),
    isArchived: false,
  };

  const h2: Habit = {
    id: 'seed_2',
    name: 'Meditate',
    icon: 'CloudRain',
    color: '#52796F', // Deeper green
    tinyHabit: 'Sit and take one deep breath',
    identityGoal: 'I am someone who is present.',
    repeatSchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    createdAt: subDays(now, 10).toISOString(),
    isArchived: false,
  };

  const h3: Habit = {
    id: 'seed_3',
    name: 'Hydrate',
    icon: 'Droplet',
    color: '#709775', // Leaf
    tinyHabit: 'Drink a glass of water upon waking',
    identityGoal: 'I am someone who takes care of my body.',
    repeatSchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdAt: subDays(now, 10).toISOString(),
    isArchived: false,
  };

  const habits = { [h1.id]: h1, [h2.id]: h2, [h3.id]: h3 };
  const entries: Record<string, HabitEntry> = {};

  // Create entries for the past 7 days
  for (let i = 0; i < 7; i++) {
    const d = subDays(now, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    
    // Some realistic random data
    if (i !== 2) { // Miss one day for h1
      entries[`${h1.id}_${dateStr}`] = {
        id: `${h1.id}_${dateStr}`,
        habitId: h1.id,
        date: dateStr,
        status: 'complete',
      };
    } else {
      entries[`${h1.id}_${dateStr}`] = {
        id: `${h1.id}_${dateStr}`,
        habitId: h1.id,
        date: dateStr,
        status: 'miss',
      };
    }

    if (i % 2 === 0) {
      entries[`${h2.id}_${dateStr}`] = {
        id: `${h2.id}_${dateStr}`,
        habitId: h2.id,
        date: dateStr,
        status: 'complete',
      };
    }

    entries[`${h3.id}_${dateStr}`] = {
      id: `${h3.id}_${dateStr}`,
      habitId: h3.id,
      date: dateStr,
      status: 'complete',
    };
  }

  const reflections: Record<string, Reflection> = {
    [`${format(subDays(now, 1), 'yyyy-MM-dd')}`]: {
      id: `ref_${format(subDays(now, 1), 'yyyy-MM-dd')}`,
      date: format(subDays(now, 1), 'yyyy-MM-dd'),
      question: 'What made today easier?',
      answer: 'Taking a short walk during lunch really cleared my head.',
    }
  };

  return {
    habits,
    entries,
    reflections,
    appState: defaultAppState,
  };
}

export function loadData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = getSeedData();
      saveData(seeded);
      return seeded;
    }
    const data = JSON.parse(raw) as Partial<StorageData>;
    return {
      ...defaultData,
      ...data,
      appState: { ...defaultAppState, ...(data.appState || {}) },
    };
  } catch (e) {
    console.error('Failed to load data', e);
    return defaultData;
  }
}

export function saveData(data: StorageData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('habitbloom_data_changed'));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}
