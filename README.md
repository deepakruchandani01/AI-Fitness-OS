# AI Fitness OS

*Your health. Your data. Your AI coach.*

A personal AI-powered fitness, calorie, activity and health tracker. Photograph meals → AI estimates calories; Apple Health fills in steps, active energy and workouts; one dashboard shows how your day is going.

## What's built (this drop)

| Area | Status |
|---|---|
| Auth (Supabase), sign-up-first flow, onboarding | ✅ |
| Postgres schema, RLS, private storage bucket, auto-profile trigger | ✅ `supabase/migrations/0001_init.sql` |
| Dashboard with the daily **energy ledger** hero, quick actions, today's food, streak | ✅ |
| Food: photo → OpenAI vision → validated JSON → edit → save; history with edit/delete | ✅ |
| Weight logging + trend chart | ✅ |
| Goals (actual vs goal) | ✅ |
| Gym tracker (Yes/No, h + min, body part, MET-based estimate) & other activities | ✅ |
| Apple Health ingestion endpoint with per-user token, tolerant normalizer, raw-payload capture, sync log | ✅ |
| Analytics 7/30/90-day charts from real `daily_logs` | ✅ (basic) |
| Streak calculation | ✅ |
| **AI Coach (LLM)** & Daily insight (LLM) | ⏳ Phase 3 — dashboard currently shows an honest rule-based summary, clearly labelled |
| Data export, notifications, PWA, delete-account (auth user) | ⏳ Phase 4 |

## Architecture

```
iPhone (Health Auto Export) ──POST JSON──▶ /api/apple-health/webhook?token=…  ─┐
     (or via Pipedream forwarding)                                              │ service-role (server only)
Browser ──▶ Next.js (App Router, server actions, RLS as the user) ─────────────▶ Supabase Postgres + Storage
Browser ──multipart──▶ /api/analyze-food ──▶ OpenAI vision (key server-side only)
```

* **Frontend:** Next.js 14, React 18, TypeScript, Tailwind, shadcn-style primitives, lucide, Recharts
* **Backend:** Supabase (Postgres, Auth, Storage), Next.js route handlers + server actions
* **AI:** OpenAI vision model with strict JSON schema output, validated with zod
* **Deploy:** Vercel + Supabase

## Calorie model (no double counting)
`total_burned = active_calories (Apple Health) + workout_calories (manual gym estimates) + other_activity_calories (manual estimates)`.
Apple-Health workouts are stored and shown but **not** added again on top of active energy. All estimates are labelled "~" / "est.".

## Project structure
```
app/            routes (auth, onboarding, (app)/dashboard|food|activity|analytics|goals|profile, api/*)
components/     ui primitives + feature components
lib/            supabase clients, ai, calculations (MET model, streak), validation (zod), apple-health normalizer
services/       server actions (auth, profile, food, activity)
supabase/       migrations
tests/          vitest unit tests
```

## Setup — see SETUP.md (step-by-step, non-technical).

## Troubleshooting
* **"Not signed in" on food analysis** → cookies blocked or `NEXT_PUBLIC_APP_URL` wrong.
* **Photo upload fails** → the `food-images` bucket/policies didn't get created; re-run the migration's STORAGE section.
* **Apple Health shows "partial … no recognized metrics"** → open Supabase → Table editor → `health_records` → row with `record_type = raw_payload` → look at `payload`. Send it to me and I'll extend `lib/apple-health/normalize.ts` for that shape. Nothing is lost.
* **OpenAI error** → check `OPENAI_API_KEY`, and that `OPENAI_VISION_MODEL` is a vision-capable model in your account.
