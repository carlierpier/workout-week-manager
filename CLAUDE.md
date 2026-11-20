# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm start` — Start Expo dev server (opens platform selector)
- `npm run web` — Start Expo dev server for web
- `npm run ios` — Start Expo dev server for iOS
- `npm run android` — Start Expo dev server for Android
- `npm run build:web` — Export production web build
- `npm run lint` — Run oxlint

## Architecture

**Workout Week Manager** is a cross-platform app (web + iOS + Android) built with Expo / React Native. A single codebase targets all platforms via `react-native-web` for the browser and Expo for native. No backend — all data lives in `AsyncStorage` (which maps to `localStorage` on web).

### Data flow

`useWeek` hook (src/useWeek.ts) is the single source of truth. It holds the current week's state and exposes all mutations (add/edit/delete workouts, toggle completion, copy week, navigate weeks). Every mutation persists to `AsyncStorage` via `src/storage.ts`.

### Data model (src/types.ts)

- **WorkoutType**: `'running' | 'indoor-bike' | 'street-workout' | 'strength'`
- Running and indoor-bike workouts have an optional `distance` (km) field
- Each **Workout** belongs to a day (0=Mon..6=Sun), has a type, optional goals list, and completed flag
- **WeekData** keyed by ISO week ID (e.g. `"2026-W45"`)
- `storage.ts` includes a migration that backfills `type: 'strength'` for data saved before types were added

### Week ID format

ISO week strings like `"2026-W45"`. All week math (navigation, copy-to-next) goes through `src/weekUtils.ts` which converts between week IDs and dates.

### Views

The App component (App.tsx) uses a responsive layout:
- **Wide screens (>=900px)** — Calendar view (7-column grid via CalendarView -> DayColumn -> WorkoutCard) with a toggle to switch to list view
- **Narrow screens (<900px)** — List view only (ListView -> WorkoutCard)

Responsiveness is handled by `src/hooks/useResponsive.ts` using `useWindowDimensions`.

WorkoutCard is shared between both views. Modals (WorkoutModal, ProgressReport) are rendered at the App level.

### Styling

React Native `StyleSheet` with a centralized theme (src/theme.ts) defining colors and radii. Dark theme throughout.

### TypeScript strictness

Uses Expo's base tsconfig with strict mode.
