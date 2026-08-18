import Link from "next/link";
import { format } from "date-fns";
import { Camera, Plus, Dumbbell, Scale, HeartPulse } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { todayISO, greeting, fmt } from "@/lib/utils";
import { computeStreak } from "@/lib/calculations/streak";
import { totalBurned } from "@/lib/calculations/calories";
import { EnergyLedger } from "@/components/dashboard/EnergyLedger";
import { Card, CardTitle, Empty } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { supabase, user } = await requireUser();
  const today = todayISO();
  const since = new Date(); since.setDate(since.getDate() - 120);
  const [{ data: profile }, { data: goals }, { data: log }, { data: foods }, { data: workouts }, { data: integ }, { data: recentLogs }, { data: recentFoods }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("goals").select("*").eq("user_id", user.id).single(),
    supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", today).maybeSingle(),
    supabase.from("food_logs").select("id, meal_type, food_name, calories").eq("user_id", user.id).eq("date", today).order("created_at"),
    supabase.from("workouts").select("workout_type, duration_minutes").eq("user_id", user.id).eq("date", today),
    supabase.from("health_integrations").select("connected, last_synced_at").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_logs").select("date, steps, calories_consumed, workout_calories, other_activity_calories, weight").eq("user_id", user.id).gte("date", since.toISOString().slice(0, 10)),
    supabase.from("food_logs").select("date").eq("user_id", user.id).gte("date", since.toISOString().slice(0, 10)),
  ]);

  const activeDates = new Set<string>();
  (recentLogs ?? []).forEach((l: any) => { if (l.steps > 0 || l.calories_consumed > 0 || l.workout_calories > 0 || l.other_activity_calories > 0 || l.weight) activeDates.add(l.date); });
  (recentFoods ?? []).forEach((f: any) => activeDates.add(f.date));
  const streak = computeStreak([...activeDates], today);

  const consumed = log?.calories_consumed ?? 0;
  const burned = log ? totalBurned(log) : 0;
  const w = workouts?.[0];
  const workoutLabel = w ? `${w.duration_minutes} min — ${w.workout_type}` : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{greeting()}, {profile?.name?.split(" ")[0] ?? "there"}</h1>
          <p className="mt-1 text-ink-2">Here&apos;s your health snapshot for {format(new Date(), "EEEE, d MMMM")}.</p>
        </div>
        <Link href="/profile#apple-health" className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs">
          <span className={`h-2 w-2 rounded-full ${integ?.connected ? "bg-sage" : "bg-ink-3"}`} />
          Apple Health {integ?.connected ? `· synced ${integ.last_synced_at ? format(new Date(integ.last_synced_at), "HH:mm") : ""}` : "not connected"}
        </Link>
      </header>

      <EnergyLedger consumed={consumed} burned={burned} calorieGoal={goals?.daily_calorie_goal ?? 2000} steps={log?.steps ?? 0} stepGoal={goals?.daily_step_goal ?? 10000}
        workoutLabel={workoutLabel} weight={log?.weight ?? profile?.current_weight ?? null} targetWeight={goals?.target_weight ?? null} streak={streak} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/food?log=1" className="card col-span-2 flex items-center gap-3 p-4 sm:col-span-1 sm:flex-col sm:items-start bg-ink text-white border-ink hover:bg-ink/90 transition"><Camera size={20} /><span className="text-sm font-medium">Log food with a photo</span></Link>
        {[[Plus, "Add activity", "/activity#other"], [Dumbbell, "Log workout", "/activity#gym"], [Scale, "Log weight", "/profile#weight"]].map(([I, l, h]: any) => (
          <Link key={l} href={h} className="card flex items-center gap-3 p-4 sm:flex-col sm:items-start hover:bg-canvas transition"><I size={20} className="text-ink-2" /><span className="text-sm font-medium">{l}</span></Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle action={<Link href="/food" className="text-sm text-ink-2 hover:text-ink">See all</Link>}>Today&apos;s food</CardTitle>
          {foods?.length ? (
            <ul className="divide-y divide-line/70">
              {foods.map((f: any) => <li key={f.id} className="flex items-center justify-between py-2.5 text-sm"><span><span className="eyebrow mr-2">{f.meal_type}</span>{f.food_name}</span><span className="num text-ink-2">{fmt(f.calories)} kcal</span></li>)}
              <li className="flex justify-between pt-3 text-sm font-medium"><span>Total</span><span className="num">{fmt(consumed)} kcal</span></li>
            </ul>
          ) : <Empty title="Your food log is empty." cta={<Link href="/food?log=1" className="btn-primary">Log your first meal</Link>} />}
        </Card>
        <Card>
          <CardTitle>Today&apos;s insight</CardTitle>
          <InsightPreview consumed={consumed} goal={goals?.daily_calorie_goal ?? 2000} steps={log?.steps ?? 0} stepGoal={goals?.daily_step_goal ?? 10000} hasWorkout={!!w} />
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-3"><HeartPulse size={13} /> The AI coach (Phase 3) will replace this with a personalised note from your full history.</p>
        </Card>
      </div>
    </div>
  );
}

/** Honest data-driven summary until the LLM coach ships in Phase 3. No random numbers, no pretending. */
function InsightPreview({ consumed, goal, steps, stepGoal, hasWorkout }: { consumed: number; goal: number; steps: number; stepGoal: number; hasWorkout: boolean }) {
  if (!consumed && !steps && !hasWorkout) return <p className="text-ink-2">Nothing logged yet today. A single photo of your next meal is enough to start.</p>;
  const stepPct = Math.round((steps / stepGoal) * 100);
  const parts: string[] = [];
  if (steps) parts.push(`You've completed ${stepPct}% of your step goal`);
  if (hasWorkout) parts.push("finished a workout");
  const cal = consumed > goal ? `you're about ${fmt(consumed - goal)} kcal above today's target` : consumed ? `you're within your calorie target with ${fmt(goal - consumed)} kcal to spare` : "";
  return <p className="text-ink-2">{[parts.join(" and "), cal].filter(Boolean).join(", and ")}. {stepPct >= 80 || hasWorkout ? "You're on track — focus on recovery and consistency." : "A relaxed 25–35 minute walk would move the needle without an intense session."}</p>;
}
