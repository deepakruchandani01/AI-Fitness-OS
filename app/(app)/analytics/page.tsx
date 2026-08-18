import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { fmt } from "@/lib/utils";
import { Card, CardTitle, Empty } from "@/components/ui/card";
import { DailyBars } from "@/components/analytics/Charts";
export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }: { searchParams: { range?: string } }) {
  const range = [7, 30, 90].includes(Number(searchParams.range)) ? Number(searchParams.range) : 7;
  const { supabase, user } = await requireUser();
  const since = new Date(); since.setDate(since.getDate() - range + 1);
  const [{ data: logs }, { data: goals }] = await Promise.all([
    supabase.from("daily_logs").select("date, steps, calories_consumed, active_calories, workout_calories, other_activity_calories, gym_duration_minutes").eq("user_id", user.id).gte("date", since.toISOString().slice(0, 10)).order("date"),
    supabase.from("goals").select("*").eq("user_id", user.id).single(),
  ]);
  const rows = (logs ?? []).map((l: any) => ({ ...l, burned: l.active_calories + l.workout_calories + l.other_activity_calories }));
  const days = rows.length || 1;
  const avg = (k: string) => Math.round(rows.reduce((s: number, r: any) => s + (r[k] ?? 0), 0) / days);
  const workouts = rows.filter((r: any) => r.gym_duration_minutes).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-3xl font-semibold tracking-tight">Analytics</h1><p className="mt-1 text-ink-2">Trends over time.</p></div>
        <div className="inline-flex rounded-xl bg-line/60 p-1">{[7, 30, 90].map((r) => <Link key={r} href={`/analytics?range=${r}`} className={`rounded-lg px-3 py-1.5 text-sm ${range === r ? "bg-surface shadow-sm" : "text-ink-3"}`}>{r} days</Link>)}</div>
      </header>
      {rows.length < 2 ? (
        <Card><Empty title="Your trends will appear here once you have a few days of data." body="Log meals, weight or connect Apple Health — charts fill in automatically." /></Card>
      ) : (
        <>
          <Card><CardTitle>This period</CardTitle>
            <div className="grid gap-4 sm:grid-cols-3 text-sm text-ink-2">
              <p>You averaged <b className="num text-ink">{fmt(avg("steps"))}</b> steps/day.</p>
              <p>Your average intake was <b className="num text-ink">{fmt(avg("calories_consumed"))}</b> kcal/day{goals ? ` (goal ${fmt(goals.daily_calorie_goal)})` : ""}.</p>
              <p>You logged <b className="num text-ink">{workouts}</b> gym session{workouts === 1 ? "" : "s"}.</p>
            </div></Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardTitle>Calories consumed vs goal</CardTitle><DailyBars data={rows} dataKey="calories_consumed" goal={goals?.daily_calorie_goal} color="#D9962B" /></Card>
            <Card><CardTitle>Steps vs goal</CardTitle><DailyBars data={rows} dataKey="steps" goal={goals?.daily_step_goal} color="#3F63D9" /></Card>
            <Card><CardTitle>Calories burned (est.)</CardTitle><DailyBars data={rows} dataKey="burned" color="#1E7A68" /></Card>
            <Card><CardTitle>Gym minutes</CardTitle><DailyBars data={rows} dataKey="gym_duration_minutes" color="#15181D" /></Card>
          </div>
        </>
      )}
    </div>
  );
}
