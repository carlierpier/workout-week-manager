# Workout Week Manager

A client-side PWA (+ native iOS via Expo) for planning and tracking weekly workouts. No backend — all data lives on-device (`localStorage` on web, `AsyncStorage` on native).

## Features

- Weekly calendar and list views for organizing workouts
- Workout types: Running, Indoor Bike, Street Workout, Strength
- Distance tracking for running and cycling
- Goals for strength and street workouts
- Progress report with completion ring and distance stats
- Copy current week to next week
- Installable PWA with offline support
- Native iOS app via Expo Go

## Web App

### Quick start

```bash
npm install
npm run dev
```

### Commands

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start Vite dev server with HMR           |
| `npm run build`     | TypeScript check + production build      |
| `npm run lint`      | Run oxlint                               |
| `npm run preview`   | Serve production build locally           |

## Mobile App (Expo)

The native app lives in `mobile/`. It shares the same data model and business logic, rebuilt with React Native components.

### Quick start

```bash
cd mobile
npm install
npx expo login
npx expo start --tunnel
```

Scan the QR code with Expo Go on your iPhone.

### Commands

| Command                        | Description                        |
| ------------------------------ | ---------------------------------- |
| `npx expo start`               | Start dev server (LAN)             |
| `npx expo start --tunnel`      | Start dev server (tunnel, any network) |

## Tech Stack

**Web:** React 19, TypeScript, Vite, vite-plugin-pwa

**Mobile:** React Native 0.88, Expo SDK 58, TypeScript, AsyncStorage, react-native-svg
