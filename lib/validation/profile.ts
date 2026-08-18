import { z } from "zod";
export const onboardingSchema = z.object({
  name: z.string().min(1).max(60),
  age: z.coerce.number().int().min(5).max(120),
  gender: z.string().max(30).optional().or(z.literal("")),
  height_cm: z.coerce.number().min(80).max(260),
  current_weight: z.coerce.number().min(20).max(400),
  target_weight: z.coerce.number().min(20).max(400),
  daily_calorie_goal: z.coerce.number().int().min(800).max(8000),
  daily_step_goal: z.coerce.number().int().min(500).max(100000),
  fitness_level: z.string().max(30).optional().or(z.literal("")),
});
export const goalsSchema = z.object({
  daily_calorie_goal: z.coerce.number().int().min(800).max(8000),
  daily_step_goal: z.coerce.number().int().min(500).max(100000),
  target_weight: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().min(20).max(400).optional()),
});
