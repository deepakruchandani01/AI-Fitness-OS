import { requireUser } from "@/lib/supabase/server";
import { todayISO, fmt } from "@/lib/utils";
import { GymForm, OtherActivityForm } from "@/components/activity/ActivityForms";
import { Card, CardTitle, Empty } from "@/components/ui/card";
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const { supabase, user } = await requireUser();
  const today = todayISO();
  const [{ data: log }, { data: workouts }, { data: acts }] = await Promise.all([
    supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", today).maybeSingle(),
    supabase.from("workouts").select("*").eq("user_id", user.id).eq("date", today).order("created_at"),
    supabase.from("activities").select("*").eq("user_id", user.id).eq("date", today).order("created_at"),
  ]);
  return (
    <div className="space-y-6">
      <header><h1 className="font-display text-3xl font-semibold tracking-tight">Activity</h1><p className="mt-1 text-ink-2">Steps and active energy arrive from Apple Health. Gym and other activities you add here.</p></header>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Steps", fmt(log?.steps ?? 0), "Apple Health"], ["Active energy", `${fmt(log?.active_calories ?? 0)} kcal`, "Apple Health"], ["Manual estimates", `${fmt((log?.workout_calories ?? 0) + (log?.other_activity_calories ?? 0))} kcal`, "gym + activities"]].map(([l, v, s]) => (
          <div key={l} className="card p-4"><p className="eyebrow">{l}</p><p className="num mt-1 font-display text-2xl font-semibold">{v}</p><p className="text-xs text-ink-3">{s}</p></div>
        ))}
      </div>
      <div id="gym"><GymForm date={today} /></div>
      <div id="other"><OtherActivityForm date={today} /></div>
      <Card>
        <CardTitle>Today&apos;s log</CardTitle>
        {(workouts?.length || acts?.length) ? (
          <ul className="divide-y divide-line/70 text-sm">
            {workouts?.map((w: any) => <li key={w.id} className="flex justify-between py-2.5"><span>{w.workout_type} · {w.duration_minutes} min <span className="ml-2 rounded-full bg-line/60 px-1.5 py-0.5 text-[10px] text-ink-3">{w.source === "apple_health" ? "Apple Health" : "gym"}</span></span><span className="num text-ink-2">~{fmt(w.calories_burned)} kcal</span></li>)}
            {acts?.map((a: any) => <li key={a.id} className="flex justify-between py-2.5"><span>{a.activity_name} · {a.duration_minutes} min</span><span className="num text-ink-2">~{fmt(a.calories_burned)} kcal</span></li>)}
          </ul>
        ) : <Empty title="No workouts logged yet." body="Log a gym session above, or connect Apple Health so workouts arrive automatically." />}
      </Card>
    </div>
  );
}
