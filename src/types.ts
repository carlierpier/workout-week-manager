export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  completed: boolean;
  day: number; // 0=Monday, 6=Sunday
}

export interface WeekData {
  weekId: string; // format: "2024-W01"
  workouts: Workout[];
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
