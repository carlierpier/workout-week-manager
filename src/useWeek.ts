import { useCallback, useEffect, useState } from 'react';
import { loadWeek, saveWeek } from './storage';
import type { DistanceType, WeekData, Workout, WorkoutType } from './types';
import { hasDistance } from './types';
import { getISOWeekId, offsetWeek } from './weekUtils';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

function redistributeDistances(workouts: Workout[], type: WorkoutType, target: number, excludeId?: string): Workout[] {
  const fixedKm = workouts
    .filter(w => w.type === type && (w.completed || w.fixedDistance || w.id === excludeId))
    .reduce((sum, w) => sum + (
      w.completed
        ? (w.actualDistance ?? w.distance ?? 0)
        : (w.distance ?? 0)
    ), 0);
  const adjustable = workouts.filter(w =>
    w.type === type &&
    !w.completed &&
    !w.fixedDistance &&
    w.id !== excludeId &&
    (w.distance ?? 0) > 0
  );
  const adjustableKm = adjustable.reduce((sum, w) => sum + (w.distance ?? 0), 0);
  const totalKm = fixedKm + adjustableKm;

  if (totalKm < target || adjustableKm === 0) return workouts;

  const remainingBudget = Math.max(0, target - fixedKm);
  const ratio = remainingBudget / adjustableKm;
  const adjustableIds = new Set(adjustable.map(w => w.id));

  return workouts.map(w =>
    adjustableIds.has(w.id)
      ? { ...w, distance: Math.round((w.distance ?? 0) * ratio) }
      : w
  );
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

  const addWorkout = useCallback((day: number, name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number, completed = false, unplanned?: boolean, fixedDistance = false, adjustOthers = false) => {
    const id = uid();
    const workout: Workout = { id, name, type, completed, unplanned, fixedDistance, adjustOthers, day, distance, actualDistance, goals };
    let workouts = [...week.workouts, workout];
    const target = hasDistance(type) ? week.targets?.[type as DistanceType] : undefined;
    if (!completed && adjustOthers && target && target > 0) {
      workouts = redistributeDistances(workouts, type, target, id);
    }
    persist({ ...week, workouts });
  }, [week, persist]);

  const updateWorkout = useCallback((workoutId: string, name: string, type: WorkoutType, distance?: number, goals?: string[], actualDistance?: number, unplanned?: boolean, completed?: boolean, fixedDistance = false, adjustOthers = false) => {
    const previous = week.workouts.find(w => w.id === workoutId);
    if (!previous) return;

    const nextCompleted = completed ?? previous.completed;
    let workouts = week.workouts.map(w =>
      w.id === workoutId ? { ...w, name, type, distance, actualDistance, goals, unplanned, fixedDistance, adjustOthers, completed: nextCompleted } : w
    );

    if (!nextCompleted && adjustOthers && hasDistance(type)) {
      const target = week.targets?.[type as DistanceType];
      if (target && target > 0) {
        workouts = redistributeDistances(workouts, type, target, workoutId);
      }
    }

    persist({ ...week, workouts });
  }, [week, persist]);

  const moveWorkout = useCallback((workoutId: string, day: number) => {
    const updated = {
      ...week,
      workouts: week.workouts.map(w =>
        w.id === workoutId ? { ...w, day } : w
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
    const previous = week.workouts.find(w => w.id === workoutId);
    if (!previous) return;

    let workouts = week.workouts.map(w =>
      w.id === workoutId ? { ...w, completed: !w.completed } : w
    );
    if (!previous.completed && previous.adjustOthers && hasDistance(previous.type)) {
      const target = week.targets?.[previous.type as DistanceType];
      if (target && target > 0) {
        workouts = redistributeDistances(workouts, previous.type, target, workoutId);
      }
    }

    persist({ ...week, workouts });
  }, [week, persist]);

  const setTarget = useCallback((type: DistanceType, km: number | undefined) => {
    const targets = { ...week.targets, [type]: km };
    persist({ ...week, targets });
  }, [week, persist]);

  const copyToNextWeek = useCallback(async () => {
    const nextId = offsetWeek(weekId, 1);
    const nextWeek = await loadWeek(nextId);
    const copiedWorkouts: Workout[] = week.workouts.map(w => ({
      ...w,
      id: uid(),
      completed: false,
      actualDistance: undefined,
    }));
    const updated: WeekData = {
      weekId: nextId,
      workouts: [...nextWeek.workouts, ...copiedWorkouts],
      targets: nextWeek.targets ?? week.targets,
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
    moveWorkout,
    deleteWorkout,
    toggleComplete,
    setTarget,
    copyToNextWeek,
  };
}
