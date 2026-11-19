import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeekData } from './types';

const STORAGE_KEY = 'workout-week-manager';

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
