import { useEffect } from 'react';
import { useStore } from './use-store';
import { getHabitsForDay, getEntryForHabitAndDay } from '../lib/stats';
import { format } from 'date-fns';

// Milliseconds until the next occurrence of HH:mm, always in the future.
function msUntilHHmm(hhmm: string, from: Date): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const next = new Date(from);
  next.setHours(hours, minutes, 0, 0);
  let diff = next.getTime() - from.getTime();
  if (diff <= 0) diff += 24 * 60 * 60 * 1000;
  return diff;
}

export function useReminders() {
  const { data } = useStore();

  useEffect(() => {
    if (!data.appState.remindersEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const todaysHabits = getHabitsForDay(Object.values(data.habits), new Date());
    const entriesList = Object.values(data.entries);

    let timeoutId: number | undefined;

    const fire = (target: Date) => {
      const targetTime = format(target, 'HH:mm');

      todaysHabits.forEach(habit => {
        if (!habit.reminderTime || habit.reminderTime !== targetTime) return;

        const entry = getEntryForHabitAndDay(entriesList, habit.id, target);
        if (entry && (entry.status === 'complete' || entry.status === 'skip')) return;

        // Check if we already notified today to prevent spam.
        const lastNotifiedKey = `notified_${habit.id}_${format(target, 'yyyy-MM-dd')}`;
        if (sessionStorage.getItem(lastNotifiedKey)) return;

        try {
          if (Notification.permission !== 'granted') return;
          new Notification('HabitBloom Reminder', {
            body: `Time for your habit: ${habit.name}. ${habit.tinyHabit}`,
            // Use BASE_URL so icons resolve correctly when deployed under a sub-path.
            icon: `${import.meta.env.BASE_URL}favicon.svg`,
          });
          sessionStorage.setItem(lastNotifiedKey, 'true');
        } catch {
          // Permission can be revoked mid-session; ignore quietly.
        }
      });

      scheduleNext();
    };

    const scheduleNext = () => {
      const now = new Date();
      const waits = todaysHabits
        .filter(h => h.reminderTime)
        .map(h => msUntilHHmm(h.reminderTime!, now));
      const wait = waits.length > 0 ? Math.min(...waits) : 24 * 60 * 60 * 1000;
      const planned = new Date(now.getTime() + wait);
      timeoutId = window.setTimeout(() => fire(planned), wait);
    };

    scheduleNext();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [data]);
}