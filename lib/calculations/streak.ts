/** A day is "meaningful" if it has any activity signal. Returns current consecutive-day streak ending today or yesterday. */
export function computeStreak(activeDates: string[], today: string) {
  const set = new Set(activeDates);
  const d = new Date(today + "T00:00:00Z");
  // allow today to be incomplete: start from today if active, else from yesterday
  if (!set.has(iso(d))) d.setUTCDate(d.getUTCDate() - 1);
  let streak = 0;
  while (set.has(iso(d))) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
  return streak;
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
export const MILESTONES = [7, 14, 30, 60, 90];
