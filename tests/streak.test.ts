import { describe, it, expect } from "vitest";
import { computeStreak } from "@/lib/calculations/streak";
describe("streak", () => {
  it("counts consecutive days ending today", () => { expect(computeStreak(["2026-08-16", "2026-08-17", "2026-08-18"], "2026-08-18")).toBe(3); });
  it("allows today to be incomplete", () => { expect(computeStreak(["2026-08-16", "2026-08-17"], "2026-08-18")).toBe(2); });
  it("breaks on a gap", () => { expect(computeStreak(["2026-08-14", "2026-08-17"], "2026-08-18")).toBe(1); });
});
