import { useEffect } from 'react';
import { useStore } from './use-store';
import { getHabitsForDay, getEntryForHabitAndDay } from '../lib/stats';
import { format } from 'date-fns';

export function useReminders() {
  const { data } = useStore();

  useEffect(() => {
    if (!data.appState.remindersEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const interval = setInterval(() => {
      const today = new Date();
      const nowTime = format(today, 'HH:mm');
      
      const todaysHabits = getHabitsForDay(Object.values(data.habits), today);
      const entriesList = Object.values(data.entries);

      todaysHabits.forEach(habit => {
        if (!habit.reminderTime) return;
        
        // Only trigger if it's exactly the minute
        if (habit.reminderTime === nowTime) {
          // Check if already done today
          const entry = getEntryForHabitAndDay(entriesList, habit.id, today);
          if (entry && (entry.status === 'complete' || entry.status === 'skip')) {
            return;
          }

          // Check if we already notified recently to prevent spam within the same minute
          const lastNotifiedKey = `notified_${habit.id}_${format(today, 'yyyy-MM-dd')}`;
          if (sessionStorage.getItem(lastNotifiedKey)) return;

          new Notification('HabitBloom Reminder', {
            body: `Time for your habit: ${habit.name}. ${habit.tinyHabit}`,
            icon: '/favicon.ico' // Assuming a favicon exists, fallback is fine
          });

          sessionStorage.setItem(lastNotifiedKey, 'true');
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [data]);
}
