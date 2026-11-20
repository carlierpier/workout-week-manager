export const WORKOUT_TYPES = [
  'running',
  'indoor-bike',
  'street-workout',
  'strength',
] as const;

export type WorkoutType = typeof WORKOUT_TYPES[number];

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  'running': 'Running',
  'indoor-bike': 'Indoor Bike',
  'street-workout': 'Street Workout',
  'strength': 'Strength',
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  'running': '#f59e0b',
  'indoor-bike': '#06b6d4',
  'street-workout': '#8b5cf6',
  'strength': '#ef4444',
};

export const WORKOUT_TYPE_DEFAULT_NAMES: Partial<Record<WorkoutType, string>> = {
  'running': 'Footing',
  'indoor-bike': 'Bike',
};

export function hasDistance(type: WorkoutType): boolean {
  return type === 'running' || type === 'indoor-bike';
}

export function hasGoals(type: WorkoutType): boolean {
  return type === 'strength' || type === 'street-workout';
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  completed: boolean;
  unplanned?: boolean;
  day: number; // 0=Monday, 6=Sunday
  distance?: number; // km, for running and indoor-bike
  actualDistance?: number; // km actually done (may differ from planned)
  goals?: string[]; // target exercises, for strength and street-workout
}

export type DistanceType = Extract<WorkoutType, 'running' | 'indoor-bike'>;

export interface WeekTargets {
  running?: number;
  'indoor-bike'?: number;
}

export interface WeekData {
  weekId: string; // format: "2024-W01"
  workouts: Workout[];
  targets?: WeekTargets;
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
