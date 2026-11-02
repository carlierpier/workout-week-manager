import type { WeekData } from './types';

const STORAGE_KEY = 'workout-week-manager';

function loadAll(): Record<string, WeekData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, WeekData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadWeek(weekId: string): WeekData {
  const all = loadAll();
  return all[weekId] ?? { weekId, workouts: [] };
}

export function saveWeek(week: WeekData) {
  const all = loadAll();
  all[week.weekId] = week;
  saveAll(all);
}

export function getAllWeekIds(): string[] {
  return Object.keys(loadAll()).sort();
}
