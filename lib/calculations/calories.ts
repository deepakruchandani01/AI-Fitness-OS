/**
 * Calorie model. Terminology:
 *  - consumed:  food intake (food_logs)
 *  - active:    Apple Health active energy for the day (already includes energy from tracked workouts
 *               that Apple recorded, so we treat it as the ceiling for AH-sourced burn)
 *  - workout:   calories from MANUAL gym sessions we estimated (not from Apple Health)
 *  - other:     calories from free-form activities we estimated
 * Rule against double counting: Apple-Health workouts are stored for display, but their calories are NOT
 * added on top of active_calories. Only manual estimates are added.
 */
export function totalBurned(l: { active_calories: number; workout_calories: number; other_activity_calories: number }) {
  return l.active_calories + l.workout_calories + l.other_activity_calories;
}
export function netCalories(consumed: number, burned: number) { return consumed - burned; }
export function pct(value: number, goal: number) {
  if (!goal || goal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / goal) * 100)));
}

/** MET values (Compendium of Physical Activities, rounded). Used for defensible estimates. */
const GYM_MET: Record<string, { light: number; moderate: number; vigorous: number }> = {
  "Upper Body": { light: 3.5, moderate: 5, vigorous: 6 },
  "Lower Body + Legs": { light: 3.5, moderate: 5.5, vigorous: 6.5 },
  "Abs & Core": { light: 2.8, moderate: 3.8, vigorous: 5 },
  Mix: { light: 3.5, moderate: 5, vigorous: 6 },
};
const ACTIVITY_MET: Record<string, { light: number; moderate: number; vigorous: number }> = {
  walking: { light: 2.8, moderate: 3.5, vigorous: 4.5 },
  running: { light: 7, moderate: 9.8, vigorous: 11.5 },
  cycling: { light: 4, moderate: 6.8, vigorous: 10 },
  swimming: { light: 4.8, moderate: 6, vigorous: 9.8 },
  yoga: { light: 2.5, moderate: 3, vigorous: 4 },
  dance: { light: 3.5, moderate: 5.5, vigorous: 7.8 },
  kickboxing: { light: 5, moderate: 7.5, vigorous: 10 },
  hiking: { light: 4.5, moderate: 6, vigorous: 7.5 },
  badminton: { light: 4.5, moderate: 5.5, vigorous: 7 },
  tennis: { light: 5, moderate: 7.3, vigorous: 8 },
  default: { light: 3, moderate: 4.5, vigorous: 6.5 },
};
export type Intensity = "light" | "moderate" | "vigorous";

/** kcal = MET × weight(kg) × hours */
function metCalories(met: number, weightKg: number, minutes: number) {
  return Math.round(met * weightKg * (minutes / 60));
}
export function estimateGymCalories(type: string, minutes: number, weightKg: number, intensity: Intensity = "moderate") {
  const t = GYM_MET[type] ?? GYM_MET.Mix;
  return metCalories(t[intensity], weightKg || 70, minutes);
}
export function estimateActivityCalories(name: string, minutes: number, weightKg: number, intensity: Intensity = "moderate") {
  const key = Object.keys(ACTIVITY_MET).find((k) => name.toLowerCase().includes(k)) ?? "default";
  return metCalories(ACTIVITY_MET[key][intensity], weightKg || 70, minutes);
}
