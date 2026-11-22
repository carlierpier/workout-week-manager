import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GoalTarget, WeekData } from './types';

const STORAGE_KEY = 'workout-week-manager';
const GOAL_TARGETS_STORAGE_KEY = 'workout-week-manager-goal-targets';

function migrate(data: Record<string, WeekData>): Record<string, WeekData> {
  for (const week of Object.values(data)) {
    for (const w of week.workouts) {
      if (!w.type) (w as any).type = 'strength';
      if ('exercises' in w) delete (w as any).exercises;
    }
  }
  return data;
}

async function loadAll(): Promise<Record<string, WeekData>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? migrate(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

async function saveAll(data: Record<string, WeekData>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function loadWeek(weekId: string): Promise<WeekData> {
  const all = await loadAll();
  return all[weekId] ?? { weekId, workouts: [] };
}

export async function saveWeek(week: WeekData): Promise<void> {
  const all = await loadAll();
  all[week.weekId] = week;
  await saveAll(all);
}

export async function loadGoalTargets(): Promise<GoalTarget[]> {
  const raw = await AsyncStorage.getItem(GOAL_TARGETS_STORAGE_KEY);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'name' in item &&
    typeof item.name === 'string' &&
    'target' in item &&
    typeof item.target === 'number' &&
    Number.isInteger(item.target) &&
    item.target > 0
  )) {
    throw new Error('Stored goal targets have an invalid format.');
  }

  return parsed;
}

export async function saveGoalTargets(goalTargets: GoalTarget[]): Promise<void> {
  await AsyncStorage.setItem(GOAL_TARGETS_STORAGE_KEY, JSON.stringify(goalTargets));
}
