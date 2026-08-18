import { describe, it, expect } from "vitest";
import { foodAnalysisSchema } from "@/lib/validation/food";
describe("AI food response validation", () => {
  it("accepts a well-formed response", () => {
    expect(foodAnalysisSchema.safeParse({ food_name: "Chicken biryani", estimated_portion: "1 plate", calories: 620, protein_g: 28, carbs_g: 72, fat_g: 22, fiber_g: 4, confidence: "medium" }).success).toBe(true);
  });
  it("rejects garbage", () => {
    expect(foodAnalysisSchema.safeParse({ food_name: "", calories: -5, confidence: "sure" }).success).toBe(false);
  });
});
