# HabitBloom

HabitBloom is a mobile-first habit-tracking PWA. Build small habits with "tiny habits," habit stacking, and identity goals, and watch your forest grow as your streak does.

## Run & Operate

- `pnpm install` — install dependencies (pnpm required)
- `pnpm --filter @workspace/habitbloom run dev` — run the web app (port 3000, override with `PORT`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web app: React 19, Vite 7, Tailwind CSS 4, wouter, TanStack Query
- PWA: web manifest + service worker (offline support)
- Data: localStorage (client-side only; no backend)

## Where things live

- `artifacts/habitbloom/` — the app (src/pages, src/components/ui, src/lib, src/hooks)
- `src/lib/types.ts` — data model (habits, entries, reflections)
- `src/lib/storage.ts` — localStorage persistence + seed data
- `src/lib/stats.ts` — streaks and forest stages
- `src/hooks/use-store.ts` — client-side store
- `scripts/` — workspace helpers (`preinstall.mjs`, `post-merge.sh`)

## Architecture decisions

- The app is intentionally client-only: all data lives in localStorage, so it works offline and needs no server. A real API/DB can be added later without touching the UI data model.
- Native build-tool binaries (esbuild, rollup, tailwind oxide, lightningcss) are installed for linux-x64 and win32 only; other platforms are excluded to keep installs lean.

## Product

- Daily check-ins (complete / skip / miss) for scheduled habits
- Streak tracking with a "forest" that grows through 5 stages
- Habit creation with tiny-habit phrasing, identity goals, habit stacking, and repeat schedules
- Calendar heatmap, weekly reflections journal, dark mode, reminders, PWA install

## Gotchas

- Install with pnpm only — `preinstall` exits if any other package manager is used.
- `vite.config.ts` defaults to port 3000 and base path `/`; `PORT` and `BASE_PATH` env vars override these (used by Replit deployments).
