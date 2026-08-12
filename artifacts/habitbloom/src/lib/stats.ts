import { Habit, HabitEntry, HabitStatus } from './types';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';

// Cycles a habit status for tap-to-undo UX: complete -> skip -> miss -> cleared.
export function cycleStatus(current?: HabitStatus): HabitStatus | undefined {
  if (!current) return 'complete';
  if (current === 'complete') return 'skip';
  if (current === 'skip') return 'miss';
  return undefined;
}

export function getHabitsForDay(habits: Habit[], date: Date) {
  const dayName = format(date, 'E'); // 'Mon', 'Tue', etc.
  return habits.filter(h => !h.isArchived && (h.repeatSchedule ?? []).includes(dayName) && new Date(h.createdAt) <= date);
}

export function getEntryForHabitAndDay(entries: HabitEntry[], habitId: string, date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return entries.find(e => e.habitId === habitId && e.date === dateStr);
}

export function getOverallStreak(habits: Habit[], entries: HabitEntry[]): number {
  let streak = 0;
  let currentDate = startOfDay(new Date());

  while (true) {
    const dayHabits = getHabitsForDay(habits, currentDate);
    if (dayHabits.length === 0) {
      if (streak === 0) break; // if no habits today and 0 streak, stop
      // if it's a rest day, just skip counting it as failure but don't break
      currentDate = subDays(currentDate, 1);
      continue;
    }

    let satisfied = true;
    let anyComplete = false;
    for (const h of dayHabits) {
      const entry = getEntryForHabitAndDay(entries, h.id, currentDate);
      if (entry?.status === 'complete') {
        anyComplete = true;
      } else if (!entry || entry.status === 'miss') {
        // If it's today and they haven't done it yet, don't break the streak yet,
        // but if it's a past day the streak is broken.
        if (!isSameDay(currentDate, new Date())) {
          satisfied = false;
          break;
        }
      }
    }

    if (!satisfied) break;

    if (anyComplete) {
      streak++;
    } else if (isSameDay(currentDate, new Date())) {
      // Today is in progress: doesn't add to streak yet but doesn't break it.
    } else {
      // A past all-skip day is an intentional rest: it doesn't add to the
      // streak but doesn't break it either (consistent with per-habit stats).
    }

    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

export interface ForestState {
  effectiveStreak: number;
  satisfiedRun: number;
  missedRun: number;
  stage: number;
  wilting: boolean;
}

// Walks the trailing two years and simulates forest health: satisfied days
// grow the forest, a missed day starts wilting it (one stage per missed day,
// 1:1 with the effective streak), and every satisfied day after a miss
// repairs one wilted day. A day with no entries yet today stays neutral.
export function getForestState(habits: Habit[], entries: HabitEntry[]): ForestState {
  let satisfiedRun = 0;
  let missedRun = 0;
  const today = startOfDay(new Date());

  for (let i = 729; i >= 0; i--) {
    const d = subDays(today, i);
    const dayHabits = getHabitsForDay(habits, d);
    if (dayHabits.length === 0) continue;

    const isToday = isSameDay(d, today);
    let anyEntry = false;
    let missed = false;

    for (const h of dayHabits) {
      const entry = getEntryForHabitAndDay(entries, h.id, d);
      if (entry) anyEntry = true;
      if (!entry || entry.status === 'miss') missed = true;
    }

    if (isToday && !anyEntry) {
      // Still in progress today: neither grows nor wilts the forest.
      continue;
    }

    if (missed) {
      if (satisfiedRun > 0) missedRun++;
      // Before any satisfied day, missed history is meaningless.
    } else if (missedRun > 0) {
      missedRun--;
    } else {
      satisfiedRun++;
    }
  }

  const effectiveStreak = Math.max(0, satisfiedRun - missedRun);
  return {
    effectiveStreak,
    satisfiedRun,
    missedRun,
    stage: getForestStage(effectiveStreak),
    wilting: missedRun > 0,
  };
}

// Completion rate (%) over the trailing N days: completions ÷ scheduled habit-days.
export function getCompletionRate(habits: Habit[], entries: HabitEntry[], windowDays: number): number {
  let totalScheduled = 0;
  let totalCompleted = 0;
  const today = startOfDay(new Date());

  for (let i = windowDays - 1; i >= 0; i--) {
    const d = subDays(today, i);
    for (const h of getHabitsForDay(habits, d)) {
      totalScheduled++;
      const e = getEntryForHabitAndDay(entries, h.id, d);
      if (e?.status === 'complete') totalCompleted++;
    }
  }

  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
}

export function getForestStage(effectiveStreak: number): number {
  if (effectiveStreak <= 0) return 0;
  if (effectiveStreak < 3) return 1;
  if (effectiveStreak < 7) return 2;
  if (effectiveStreak < 14) return 3;
  if (effectiveStreak < 30) return 4;
  if (effectiveStreak < 60) return 5;
  if (effectiveStreak < 100) return 6;
  if (effectiveStreak < 365) return 7;
  return 8;
}
