export type Confidence = "low" | "medium" | "high";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Profile {
  id: string; email: string | null; name: string | null; age: number | null;
  gender: string | null; height_cm: number | null; current_weight: number | null;
  fitness_level: string | null; preferred_activities: string[] | null;
  units: "metric" | "imperial"; onboarding_complete: boolean;
}
export interface Goals {
  user_id: string; daily_calorie_goal: number; daily_step_goal: number;
  target_weight: number | null; weekly_activity_minutes: number | null; weekly_workout_target: number | null;
}
export interface DailyLog {
  id: string; user_id: string; date: string; steps: number; active_calories: number;
  workout_calories: number; other_activity_calories: number; total_calories_burned: number;
  calories_consumed: number; gym: boolean; gym_duration_minutes: number | null;
  workout_type: string | null; weight: number | null;
}
export interface FoodLog {
  id: string; user_id: string; date: string; meal_type: MealType; image_url: string | null;
  food_name: string; portion: string | null; calories: number; protein: number | null;
  carbs: number | null; fat: number | null; fiber: number | null; ai_confidence: Confidence | null;
  created_at: string;
}
export interface Workout {
  id: string; user_id: string; date: string; source: "manual" | "apple_health"; workout_type: string;
  duration_minutes: number; calories_burned: number; intensity: string | null;
}
export interface WeightEntry { id: string; date: string; weight: number; }
export interface HealthIntegration { user_id: string; ingest_token: string; connected: boolean; last_synced_at: string | null; }
