import { useCallback, useEffect, useState } from 'react';
import { loadWeek, saveWeek } from './storage';
import type { WeekData, Workout, WorkoutType } from './types';
import { getISOWeekId, offsetWeek } from './weekUtils';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function useWeek() {
  const [weekId, setWeekId] = useState(() => getISOWeekId(new Date()));
  const [week, setWeek] = useState<WeekData>({ weekId: getISOWeekId(new Date()), workouts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadWeek(weekId).then(data => {
      setWeek(data);
      setLoading(false);
    });
  }, [weekId]);

  const persist = useCallback((updated: WeekData) => {
    setWeek(updated);
    saveWeek(updated);
  }, []);

  const navigateWeek = useCallback((offset: number) => {
    const newId = offsetWeek(weekId, offset);
    setWeekId(newId);
  }, [weekId]);

  const goToCurrentWeek = useCallback(() => {
    setWeekId(getISOWeekId(new Date()));
  }, []);

  const addWorkout = useCallback((day: number, name: string, type: WorkoutType, distance?: number, goals?: string[]) => {
    const workout: Workout = { id: uid(), name, type, completed: false, day, distance, goals };
    const updated = { ...week, workouts: [...week.workouts, workout] };
    persist(updated);
  }, [week, persist]);

  const updateWorkout = useCallback((workoutId: string, name: string, type: WorkoutType, distance?: number, goals?: string[]) => {
    const updated = {
      ...week,
      workouts: week.workouts.map(w =>
        w.id === workoutId ? { ...w, name, type, distance, goals } : w
      ),
    };
    persist(updated);
  }, [week, persist]);

  const deleteWorkout = useCallback((workoutId: string) => {
    const updated = {
      ...week,
      workouts: week.workouts.filter(w => w.id !== workoutId),
    };
    persist(updated);
  }, [week, persist]);

  const toggleComplete = useCallback((workoutId: string) => {
    const updated = {
      ...week,
      workouts: week.workouts.map(w =>
        w.id === workoutId ? { ...w, completed: !w.completed } : w
      ),
    };
    persist(updated);
  }, [week, persist]);

  const copyToNextWeek = useCallback(async () => {
    const nextId = offsetWeek(weekId, 1);
    const nextWeek = await loadWeek(nextId);
    const copiedWorkouts: Workout[] = week.workouts.map(w => ({
      ...w,
      id: uid(),
      completed: false,
    }));
    const updated: WeekData = {
      weekId: nextId,
      workouts: [...nextWeek.workouts, ...copiedWorkouts],
    };
    await saveWeek(updated);
    setWeekId(nextId);
    setWeek(updated);
  }, [week, weekId]);

  return {
    weekId,
    week,
    loading,
    navigateWeek,
    goToCurrentWeek,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    toggleComplete,
    copyToNextWeek,
  };
}
