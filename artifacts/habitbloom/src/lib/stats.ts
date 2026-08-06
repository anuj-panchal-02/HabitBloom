import { Habit, HabitEntry } from './types';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';

export function getHabitsForDay(habits: Habit[], date: Date) {
  const dayName = format(date, 'E'); // 'Mon', 'Tue', etc.
  return habits.filter(h => !h.isArchived && h.repeatSchedule.includes(dayName) && new Date(h.createdAt) <= date);
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

    let allCompletedOrSkipped = true;
    let anyHabitDone = false;
    for (const h of dayHabits) {
      const entry = getEntryForHabitAndDay(entries, h.id, currentDate);
      if (!entry || entry.status === 'miss') {
        // If it's today and they haven't done it yet, don't break the streak yet, 
        // but if it's yesterday, the streak is broken.
        if (!isSameDay(currentDate, new Date())) {
          allCompletedOrSkipped = false;
          break;
        }
      } else {
        if (entry.status === 'complete') anyHabitDone = true;
      }
    }

    if (!allCompletedOrSkipped) break;

    // Only add to streak if it's a past day or today has completions
    if (anyHabitDone || !isSameDay(currentDate, new Date())) {
      streak++;
    } else if (isSameDay(currentDate, new Date()) && !anyHabitDone) {
      // Today is in progress, doesn't add to streak yet but doesn't break it
    }

    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

export function getForestStage(streak: number): number {
  if (streak === 0) return 0;
  if (streak < 3) return 1;
  if (streak < 7) return 2;
  if (streak < 14) return 3;
  if (streak < 30) return 4;
  return 5;
}
