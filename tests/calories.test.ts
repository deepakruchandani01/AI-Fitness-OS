import { describe, it, expect } from "vitest";
import { estimateGymCalories, estimateActivityCalories, totalBurned, pct } from "@/lib/calculations/calories";
describe("calorie estimates", () => {
  it("scales with weight and duration (MET model)", () => {
    expect(estimateGymCalories("Upper Body", 60, 70)).toBe(350);
    expect(estimateGymCalories("Upper Body", 30, 70)).toBe(175);
    expect(estimateGymCalories("Upper Body", 60, 90)).toBeGreaterThan(estimateGymCalories("Upper Body", 60, 70));
  });
  it("uses activity-specific METs", () => { expect(estimateActivityCalories("Kickboxing class", 30, 70)).toBeGreaterThan(estimateActivityCalories("Gentle yoga", 30, 70)); });
  it("does not double count", () => { expect(totalBurned({ active_calories: 400, workout_calories: 200, other_activity_calories: 50 })).toBe(650); });
  it("clamps percentages", () => { expect(pct(15000, 10000)).toBe(100); expect(pct(0, 0)).toBe(0); });
});
