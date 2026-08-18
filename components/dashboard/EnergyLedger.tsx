import { fmt, pct } from "@/lib/utils";
import { Bar } from "@/components/ui/progress";

export function EnergyLedger({ consumed, burned, calorieGoal, steps, stepGoal, workoutLabel, weight, targetWeight, streak }:
  { consumed: number; burned: number; calorieGoal: number; steps: number; stepGoal: number; workoutLabel: string | null; weight: number | null; targetWeight: number | null; streak: number }) {
  const net = consumed - burned;
  const remaining = calorieGoal - consumed;
  const max = Math.max(consumed, burned, calorieGoal, 1);
  return (
    <section className="card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sage-soft/70 blur-3xl" />
      <div className="relative">
        <p className="eyebrow">Today&apos;s energy ledger</p>
        <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
          <p className="num font-display text-[56px] font-semibold leading-none tracking-tight sm:text-[68px]">{fmt(net)}</p>
          <div className="pb-2 text-sm text-ink-2">net kcal · {remaining >= 0 ? <><span className="text-sage font-medium">{fmt(remaining)}</span> left in your goal</> : <><span className="text-amber font-medium">{fmt(-remaining)}</span> over your goal</>}</div>
        </div>
        {/* two-sided balance bar */}
        <div className="mt-6 space-y-2">
          <Row label="Consumed" value={consumed} max={max} color="bg-amber" note={`goal ${fmt(calorieGoal)}`} />
          <Row label="Burned" value={burned} max={max} color="bg-sage" note="active + workouts (est.)" />
        </div>
        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          <Stat label="Steps" value={fmt(steps)} sub={`of ${fmt(stepGoal)}`}><Bar pct={pct(steps, stepGoal)} color="bg-sky" className="mt-2" /></Stat>
          <Stat label="Workout" value={workoutLabel ?? "—"} sub={workoutLabel ? "logged today" : "none yet"} />
          <Stat label="Weight" value={weight ? `${weight} kg` : "—"} sub={weight && targetWeight ? `${(weight - targetWeight) > 0 ? "−" : "+"}${Math.abs(weight - targetWeight).toFixed(1)} to goal` : "log to see trend"} />
          <Stat label="Streak" value={streak ? `${streak} day${streak === 1 ? "" : "s"}` : "Start today"} sub={streak ? "🔥 keep it rolling" : "any log counts"} />
        </div>
      </div>
    </section>
  );
}
function Row({ label, value, max, color, note }: { label: string; value: number; max: number; color: string; note: string }) {
  return (
    <div className="grid grid-cols-[84px_1fr_auto] items-center gap-3 text-sm">
      <span className="text-ink-2">{label}</span>
      <div className="h-2.5 rounded-full bg-line"><div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${(value / max) * 100}%` }} /></div>
      <span className="num text-right"><span className="font-medium">{fmt(value)}</span> <span className="text-ink-3">· {note}</span></span>
    </div>
  );
}
function Stat({ label, value, sub, children }: { label: string; value: string; sub: string; children?: React.ReactNode }) {
  return <div><p className="eyebrow">{label}</p><p className="num mt-1 font-display text-xl font-semibold tracking-tight">{value}</p><p className="text-xs text-ink-3">{sub}</p>{children}</div>;
}
