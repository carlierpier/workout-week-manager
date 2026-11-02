import { useCallback, useState } from 'react'
import { loadWeek, saveWeek } from './storage'
import type { Exercise, WeekData, Workout } from './types'
import { getISOWeekId, offsetWeek } from './weekUtils'

function uid() {
  return crypto.randomUUID()
}

export function useWeek() {
  const [weekId, setWeekId] = useState(() => getISOWeekId(new Date()))
  const [week, setWeek] = useState<WeekData>(() => loadWeek(getISOWeekId(new Date())))

  const persist = useCallback((updated: WeekData) => {
    setWeek(updated)
    saveWeek(updated)
  }, [])

  const navigateWeek = useCallback((offset: number) => {
    const newId = offsetWeek(weekId, offset)
    setWeekId(newId)
    setWeek(loadWeek(newId))
  }, [weekId])

  const goToCurrentWeek = useCallback(() => {
    const id = getISOWeekId(new Date())
    setWeekId(id)
    setWeek(loadWeek(id))
  }, [])

  const addWorkout = useCallback((day: number, name: string, exercises: Exercise[]) => {
    const workout: Workout = { id: uid(), name, exercises, completed: false, day }
    const updated = { ...week, workouts: [...week.workouts, workout] }
    persist(updated)
  }, [week, persist])

  const updateWorkout = useCallback((workoutId: string, name: string, exercises: Exercise[]) => {
    const updated = {
      ...week,
      workouts: week.workouts.map(w =>
        w.id === workoutId ? { ...w, name, exercises } : w
      ),
    }
    persist(updated)
  }, [week, persist])

  const deleteWorkout = useCallback((workoutId: string) => {
    const updated = {
      ...week,
      workouts: week.workouts.filter(w => w.id !== workoutId),
    }
    persist(updated)
  }, [week, persist])

  const toggleComplete = useCallback((workoutId: string) => {
    const updated = {
      ...week,
      workouts: week.workouts.map(w =>
        w.id === workoutId ? { ...w, completed: !w.completed } : w
      ),
    }
    persist(updated)
  }, [week, persist])

  const copyToNextWeek = useCallback(() => {
    const nextId = offsetWeek(weekId, 1)
    const nextWeek = loadWeek(nextId)
    const copiedWorkouts: Workout[] = week.workouts.map(w => ({
      ...w,
      id: uid(),
      completed: false,
      exercises: w.exercises.map(e => ({ ...e, id: uid() })),
    }))
    const updated: WeekData = {
      weekId: nextId,
      workouts: [...nextWeek.workouts, ...copiedWorkouts],
    }
    saveWeek(updated)
    setWeekId(nextId)
    setWeek(updated)
  }, [week, weekId])

  return {
    weekId,
    week,
    navigateWeek,
    goToCurrentWeek,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    toggleComplete,
    copyToNextWeek,
  }
}
