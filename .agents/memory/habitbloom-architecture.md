---
name: HabitBloom architecture
description: Why HabitBloom has no backend/API and persists everything client-side.
---

HabitBloom (habit tracker) intentionally has no `artifacts/api-server` routes, no OpenAPI additions, and no `lib/db` schema. The source PRD explicitly puts accounts, login, and cloud sync out of scope for V1 — all data (habits, entries, reflections, settings) lives in the browser via localStorage/IndexedDB.

**Why:** Matches the product's stated non-goals (no accounts, no cloud sync, local database only, no PII). Adding a backend would contradict the spec and add needless complexity.

**How to apply:** If the user later asks for cross-device sync, login, or cloud backup (PRD's V2 roadmap), that's a deliberate scope change — introduce OpenAPI endpoints, DB schema, and auth (Clerk/Replit Auth) at that point rather than assuming it's already wired up.
