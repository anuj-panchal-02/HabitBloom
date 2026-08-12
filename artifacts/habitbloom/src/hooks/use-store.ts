import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, validateImport, StorageData, STORAGE_KEY } from '../lib/storage';
import { Habit, HabitEntry, Reflection, AppState } from '../lib/types';
import { format } from 'date-fns';

let memoryState = loadData();

export function useStore() {
  const [data, setData] = useState<StorageData>(memoryState);

  useEffect(() => {
    const handleStorageChange = () => {
      memoryState = loadData();
      setData(memoryState);
    };

    const handleCrossTabChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        memoryState = loadData();
        setData(memoryState);
      }
    };

    window.addEventListener('habitbloom_data_changed', handleStorageChange);
    window.addEventListener('storage', handleCrossTabChange);
    return () => {
      window.removeEventListener('habitbloom_data_changed', handleStorageChange);
      window.removeEventListener('storage', handleCrossTabChange);
    };
  }, []);

  const setAppState = useCallback((updates: Partial<AppState>) => {
    memoryState = {
      ...memoryState,
      appState: { ...memoryState.appState, ...updates },
    };
    saveData(memoryState);
  }, []);

  const addHabit = useCallback((habit: Habit) => {
    memoryState = {
      ...memoryState,
      habits: { ...memoryState.habits, [habit.id]: habit },
    };
    saveData(memoryState);
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    if (!memoryState.habits[id]) return;
    memoryState = {
      ...memoryState,
      habits: {
        ...memoryState.habits,
        [id]: { ...memoryState.habits[id], ...updates },
      },
    };
    saveData(memoryState);
  }, []);

  const deleteHabit = useCallback((id: string) => {
    const newHabits = { ...memoryState.habits };
    delete newHabits[id];

    // Habits stacked onto the deleted one lose their anchor so no dead
    // references survive in storage or in exported backups.
    for (const otherId in newHabits) {
      if (newHabits[otherId].anchorHabitId === id) {
        newHabits[otherId] = { ...newHabits[otherId], anchorHabitId: undefined };
      }
    }

    // Also cleanup entries? We might want to keep them for history or delete. Let's delete.
    const newEntries = { ...memoryState.entries };
    for (const entryId in newEntries) {
      if (newEntries[entryId].habitId === id) {
        delete newEntries[entryId];
      }
    }

    memoryState = {
      ...memoryState,
      habits: newHabits,
      entries: newEntries,
    };
    saveData(memoryState);
  }, []);

  const setEntry = useCallback((entry: HabitEntry) => {
    memoryState = {
      ...memoryState,
      entries: { ...memoryState.entries, [entry.id]: entry },
    };
    saveData(memoryState);
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    const newEntries = { ...memoryState.entries };
    delete newEntries[entryId];
    memoryState = {
      ...memoryState,
      entries: newEntries,
    };
    saveData(memoryState);
  }, []);

  const setReflection = useCallback((reflection: Reflection) => {
    memoryState = {
      ...memoryState,
      reflections: { ...memoryState.reflections, [reflection.date]: reflection },
    };
    saveData(memoryState);
  }, []);

  const resetAllData = useCallback(() => {
    const empty: StorageData = {
      habits: {},
      entries: {},
      reflections: {},
      appState: { hasSeenSplash: true, theme: 'light', remindersEnabled: false },
    };
    memoryState = empty;
    saveData(empty);
  }, []);

  const importData = useCallback((importedData: unknown) => {
    const validated = validateImport(importedData);
    if (!validated) return false;
    memoryState = validated;
    saveData(memoryState);
    return true;
  }, []);

  return {
    data,
    setAppState,
    addHabit,
    updateHabit,
    deleteHabit,
    setEntry,
    removeEntry,
    setReflection,
    resetAllData,
    importData,
  };
}
