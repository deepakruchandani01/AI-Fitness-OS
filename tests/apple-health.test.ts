import { describe, it, expect } from "vitest";
import { normalizeHealthPayload } from "@/lib/apple-health/normalize";
describe("Health Auto Export normalization", () => {
  it("aggregates multiple step records per day and parses workouts", () => {
    const n = normalizeHealthPayload({ data: {
      metrics: [
        { name: "step_count", units: "count", data: [{ date: "2026-08-18 08:00:00 +0530", qty: 4000 }, { date: "2026-08-18 12:00:00 +0530", qty: 2500 }, { date: "2026-08-18 18:00:00 +0530", qty: 1900 }] },
        { name: "active_energy", units: "kcal", data: [{ date: "2026-08-18 23:59:00 +0530", qty: 520.4 }] },
      ],
      workouts: [{ name: "Traditional Strength Training", start: "2026-08-18 07:00:00 +0530", end: "2026-08-18 08:00:00 +0530", activeEnergyBurned: { qty: 340, units: "kcal" } }],
    } });
    expect(n.days["2026-08-18"].steps).toBe(8400);
    expect(n.days["2026-08-18"].active_calories).toBe(520);
    expect(n.workouts[0].duration_minutes).toBe(60);
    expect(n.workouts[0].calories_burned).toBe(340);
  });
  it("handles flat HK-identifier records", () => {
    const n = normalizeHealthPayload([{ type: "HKQuantityTypeIdentifierStepCount", value: 1200, startDate: "2026-08-17T10:00:00Z" }]);
    expect(n.days["2026-08-17"].steps).toBe(1200);
  });
  it("stores nothing but does not crash on unknown shapes", () => { expect(normalizeHealthPayload({ hello: "world" }).recordCount).toBe(0); });
});
