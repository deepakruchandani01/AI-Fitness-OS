import { z } from "zod";

export const foodAnalysisSchema = z.object({
  food_name: z.string().min(1).max(120),
  estimated_portion: z.string().min(1).max(80),
  calories: z.number().min(0).max(5000),
  protein_g: z.number().min(0).max(500),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(500),
  fiber_g: z.number().min(0).max(200),
  confidence: z.enum(["low", "medium", "high"]),
});
export type FoodAnalysis = z.infer<typeof foodAnalysisSchema>;

export const foodLogInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  food_name: z.string().min(1).max(120),
  portion: z.string().max(80).optional().nullable(),
  calories: z.coerce.number().int().min(0).max(5000),
  protein: z.coerce.number().min(0).max(500).default(0),
  carbs: z.coerce.number().min(0).max(1000).default(0),
  fat: z.coerce.number().min(0).max(500).default(0),
  fiber: z.coerce.number().min(0).max(200).default(0),
  ai_confidence: z.enum(["low", "medium", "high"]).optional().nullable(),
  image_url: z.string().optional().nullable(),
});
export type FoodLogInput = z.infer<typeof foodLogInputSchema>;
