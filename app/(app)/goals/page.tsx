import { requireUser } from "@/lib/supabase/server";
import { GoalsForm } from "@/components/profile/GoalsForm";
import { todayISO, fmt, pct } from "@/lib/utils";
import { Bar } from "@/components/ui/progress";
export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const { supabase, user } = await requireUser();
  const [{ data: goals }, { data: log }, { data: profile }] = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", user.id).single(),
    supabase.from("daily_logs").select("steps, calories_consumed, weight").eq("user_id", user.id).eq("date", todayISO()).maybeSingle(),
    supabase.from("profiles").select("current_weight").eq("id", user.id).single(),
  ]);
  const w = log?.weight ?? profile?.current_weight;
  return (
    <div className="space-y-6">
      <header><h1 className="font-display text-3xl font-semibold tracking-tight">Goals</h1><p className="mt-1 text-ink-2">Actual vs goal for today.</p></header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4"><p className="eyebrow">Calories</p><p className="num mt-1 font-display text-2xl font-semibold">{fmt(log?.calories_consumed ?? 0)} <span className="text-base font-normal text-ink-3">/ {fmt(goals?.daily_calorie_goal ?? 0)}</span></p><Bar pct={pct(log?.calories_consumed ?? 0, goals?.daily_calorie_goal ?? 1)} color="bg-amber" className="mt-3" /></div>
        <div className="card p-4"><p className="eyebrow">Steps</p><p className="num mt-1 font-display text-2xl font-semibold">{fmt(log?.steps ?? 0)} <span className="text-base font-normal text-ink-3">/ {fmt(goals?.daily_step_goal ?? 0)}</span></p><Bar pct={pct(log?.steps ?? 0, goals?.daily_step_goal ?? 1)} color="bg-sky" className="mt-3" /></div>
        <div className="card p-4"><p className="eyebrow">Weight</p><p className="num mt-1 font-display text-2xl font-semibold">{w ?? "—"} <span className="text-base font-normal text-ink-3">→ {goals?.target_weight ?? "—"} kg</span></p><p className="mt-3 text-xs text-ink-3">{w && goals?.target_weight ? `${Math.abs(w - goals.target_weight).toFixed(1)} kg to go` : "Set a target below"}</p></div>
      </div>
      <div className="card p-6"><h2 className="mb-4 font-display text-[17px] font-semibold">Edit goals</h2><GoalsForm goals={goals} /></div>
    </div>
  );
}
