# Setup guide (no coding experience needed)

You'll do this once. Budget ~45 minutes. Have these accounts ready (all have free tiers): **GitHub**, **Supabase**, **OpenAI** (needs a paid balance, ~$5 is plenty), **Vercel**.

---

## Part 1 — Put the code on GitHub
1. Go to github.com → **New repository** → name it `ai-fitness-os` → Create.
2. On the new repo page click **uploading an existing file**, drag the entire unzipped project folder in, click **Commit changes**.
   (If your browser won't upload folders, install **GitHub Desktop**, choose *Add local repository*, pick the folder, *Publish*.)

## Part 2 — Supabase (database, login, photo storage)
3. supabase.com → **New project** → name it, choose a strong database password (save it), region closest to you → Create. Wait ~2 min.
4. Left menu **SQL Editor** → **New query** → open the file `supabase/migrations/0001_init.sql` from the project, copy *everything*, paste, click **Run**. You should see "Success". This creates all tables, security rules and the private photo bucket.
5. Left menu **Authentication → Providers → Email**: keep it enabled. *(Optional for testing: turn **Confirm email** OFF so you can sign in immediately.)*
6. Left menu **Project Settings → API**. Copy three things into a notes file:
   * **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   * **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ secret — never share, never put in the browser.

## Part 3 — OpenAI
7. platform.openai.com → **API keys → Create new secret key** → copy it → `OPENAI_API_KEY`. Add at least $5 credit under Billing.

## Part 4 — Deploy on Vercel
8. vercel.com → **Add New → Project** → Import your `ai-fitness-os` GitHub repo.
9. Before clicking Deploy, open **Environment Variables** and add, one by one:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from step 6 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 6 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 6 |
| `OPENAI_API_KEY` | from step 7 |
| `OPENAI_VISION_MODEL` | `gpt-4o-mini` (or `gpt-4o` for better accuracy) |
| `APPLE_HEALTH_WEBHOOK_SECRET` | leave empty for now |
| `NEXT_PUBLIC_APP_URL` | leave empty for now |

10. Click **Deploy**. When done, copy your site URL (e.g. `https://ai-fitness-os-xyz.vercel.app`).
11. Vercel → your project → **Settings → Environment Variables** → set `NEXT_PUBLIC_APP_URL` to that URL → **Deployments → ⋯ → Redeploy**.
12. Supabase → **Authentication → URL Configuration** → Site URL = your Vercel URL; add `https://<your-url>/auth/callback` to Redirect URLs.

## Part 5 — First run
13. Open your site → **Create your account** → complete onboarding → you're on the dashboard.
14. Tap **Log food with a photo**, take a picture, tap **Estimate calories with AI**, adjust, **Save meal**.

## Part 6 — Apple Health (iPhone)
15. In the app go to **Profile → Apple Health**. Copy your personal URL (it contains a secret token unique to you).
16. iPhone → **Health Auto Export** app → **Automations → + → REST API**:
   * URL: paste the copied URL · Method **POST** · Format **JSON**
   * Data: **Steps**, **Active Energy**, **Workouts** · Aggregate: **Daily** · Enable "Run automatically"
   * Tap **Run now**.
17. Refresh Profile — it should read **Connected · Last synced just now**, and steps appear on the dashboard.

**Keeping Pipedream (optional):** in your existing Pipedream workflow, add a step *"Send any HTTP request"* → POST → URL = your personal URL from step 15 → Body = `{{steps.trigger.event.body}}` → Deploy. Health Auto Export then keeps pointing at Pipedream and Pipedream forwards to your app.

If the sync log says *"no recognized metrics found"*, your payload shape is one I haven't seen. Supabase → Table Editor → `health_records` → copy the `payload` of the newest `raw_payload` row and paste it into our chat; I'll adjust the normalizer.

## Running locally (optional, only if you want to tinker)
```
npm install
cp .env.example .env.local   # fill in the values from above; NEXT_PUBLIC_APP_URL=http://localhost:3000
npm run dev                  # http://localhost:3000
npm test                     # unit tests
```

## Production checklist
- [ ] Sign up, confirm email, sign in on phone and desktop
- [ ] Log a meal by photo; edit; delete — dashboard total updates
- [ ] Log weight; trend appears after 2+ days
- [ ] Gym Yes → 1h Upper Body → estimate shows and appears in Activity/Dashboard
- [ ] Apple Health "Run now" → Profile shows Connected; steps on dashboard
- [ ] Try opening someone else's data: impossible by design (RLS) — create a second account and confirm you see nothing from the first
