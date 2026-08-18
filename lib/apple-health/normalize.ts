/**
 * Tolerant normalizer for Health Auto Export payloads.
 * Real payloads vary. Known shapes:
 *   { data: { metrics: [{ name, units, data: [{ date, qty }] }], workouts: [{ name, start, end, duration, activeEnergyBurned:{qty} }] } }
 *   { metrics: [...] }, arrays at the root, or field variants (value/qty, name/type/identifier).
 * Unknown structures are still stored raw (health_records.payload) so nothing is lost.
 */
export type NormalizedDay = { date: string; steps: number; active_calories: number };
export type NormalizedWorkout = {
  apple_health_id: string; workout_type: string; date: string; started_at?: string; ended_at?: string;
  duration_minutes: number; calories_burned: number; raw: unknown;
};
export type NormalizedPayload = { days: Record<string, NormalizedDay>; workouts: NormalizedWorkout[]; recordCount: number };

const STEP_KEYS = ["step_count", "steps", "hkquantitytypeidentifierstepcount"];
const ENERGY_KEYS = ["active_energy", "active_energy_burned", "activeenergyburned", "hkquantitytypeidentifieractiveenergyburned"];

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[\s\-]/g, "_");
const num = (v: unknown) => { const n = typeof v === "string" ? parseFloat(v) : Number(v); return Number.isFinite(n) ? n : 0; };
const toDate = (v: unknown): string | null => {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/); if (m) return m[1];
  const d = new Date(s); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};
const kcal = (v: unknown, units?: unknown) => { const n = num(v); return norm(units) === "kj" ? n / 4.184 : n; };

function findArrays(obj: unknown, key: string, out: unknown[] = [], depth = 0): unknown[] {
  if (!obj || typeof obj !== "object" || depth > 6) return out;
  if (Array.isArray(obj)) { obj.forEach((o) => findArrays(o, key, out, depth + 1)); return out; }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k.toLowerCase() === key && Array.isArray(v)) out.push(...v);
    else findArrays(v, key, out, depth + 1);
  }
  return out;
}

export function normalizeHealthPayload(payload: unknown): NormalizedPayload {
  const days: Record<string, NormalizedDay> = {};
  const day = (d: string) => (days[d] ??= { date: d, steps: 0, active_calories: 0 });
  let recordCount = 0;

  // metrics
  const metrics = findArrays(payload, "metrics");
  for (const m of metrics as any[]) {
    const name = norm(m?.name ?? m?.type ?? m?.identifier);
    const units = m?.units ?? m?.unit;
    const points: any[] = Array.isArray(m?.data) ? m.data : Array.isArray(m?.values) ? m.values : [];
    for (const p of points) {
      const d = toDate(p?.date ?? p?.startDate ?? p?.start ?? p?.timestamp);
      if (!d) continue;
      const q = p?.qty ?? p?.value ?? p?.quantity ?? p?.sum;
      if (STEP_KEYS.includes(name)) { day(d).steps += Math.round(num(q)); recordCount++; }
      else if (ENERGY_KEYS.includes(name)) { day(d).active_calories += kcal(q, units); recordCount++; }
    }
  }
  // flat quantity records (e.g. [{type:"HKQuantityTypeIdentifierStepCount", value, startDate}])
  const flat = Array.isArray(payload) ? payload : findArrays(payload, "records").concat(findArrays(payload, "samples"));
  for (const r of flat as any[]) {
    const name = norm(r?.type ?? r?.name ?? r?.identifier);
    const d = toDate(r?.date ?? r?.startDate ?? r?.start);
    if (!d) continue;
    const q = r?.qty ?? r?.value ?? r?.quantity;
    if (STEP_KEYS.includes(name)) { day(d).steps += Math.round(num(q)); recordCount++; }
    else if (ENERGY_KEYS.includes(name)) { day(d).active_calories += kcal(q, r?.units ?? r?.unit); recordCount++; }
  }
  for (const d of Object.values(days)) d.active_calories = Math.round(d.active_calories);

  // workouts
  const workouts: NormalizedWorkout[] = [];
  for (const w of findArrays(payload, "workouts") as any[]) {
    const start = w?.start ?? w?.startDate ?? w?.start_time;
    const end = w?.end ?? w?.endDate ?? w?.end_time;
    const date = toDate(start); if (!date) continue;
    let mins = num(w?.duration_minutes ?? w?.durationMinutes);
    if (!mins && w?.duration != null) { const dur = num(w.duration); mins = dur > 1000 ? dur / 60 : dur; } // seconds vs minutes heuristic
    if (!mins && start && end) mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    const energy = w?.activeEnergyBurned ?? w?.activeEnergy ?? w?.totalEnergyBurned ?? w?.calories;
    const cals = typeof energy === "object" && energy ? kcal(energy.qty ?? energy.value, energy.units) : num(energy);
    const type = String(w?.name ?? w?.workoutActivityType ?? w?.type ?? "Workout").replace(/^HKWorkoutActivityType/, "");
    workouts.push({
      apple_health_id: String(w?.id ?? w?.uuid ?? `${type}-${start}`),
      workout_type: type, date, started_at: start ? new Date(start).toISOString() : undefined,
      ended_at: end ? new Date(end).toISOString() : undefined,
      duration_minutes: Math.max(1, Math.round(mins)), calories_burned: Math.round(cals), raw: w,
    });
    recordCount++;
  }
  return { days, workouts, recordCount };
}
