"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { onboardingSchema, goalsSchema } from "@/lib/validation/profile";
import { todayISO } from "@/lib/utils";

export async function completeOnboarding(_: unknown, formData: FormData) {
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const v = parsed.data;
  const { supabase, user } = await requireUser();
  const { error: e1 } = await supabase.from("profiles").update({
    name: v.name, age: v.age, gender: v.gender || null, height_cm: v.height_cm, current_weight: v.current_weight,
    fitness_level: v.fitness_level || null, onboarding_complete: true }).eq("id", user.id);
  const { error: e2 } = await supabase.from("goals").upsert({ user_id: user.id, daily_calorie_goal: v.daily_calorie_goal,
    daily_step_goal: v.daily_step_goal, target_weight: v.target_weight }, { onConflict: "user_id" });
  await supabase.from("weight_entries").upsert({ user_id: user.id, date: todayISO(), weight: v.current_weight }, { onConflict: "user_id,date" });
  if (e1 || e2) return { error: "Couldn't save your details. Please try again." };
  redirect("/dashboard");
}

export async function updateGoals(_: unknown, formData: FormData) {
  const parsed = goalsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please enter valid goal values." };
  const { supabase, user } = await requireUser();
  const { daily_calorie_goal, daily_step_goal, target_weight } = parsed.data;
  const { error } = await supabase.from("goals").upsert({ user_id: user.id, daily_calorie_goal, daily_step_goal,
    target_weight: target_weight ?? null }, { onConflict: "user_id" });
  if (error) return { error: "Couldn't save goals." };
  revalidatePath("/goals"); revalidatePath("/dashboard");
  return { message: "Goals saved." };
}

export async function logWeight(_: unknown, formData: FormData) {
  const weight = Number(formData.get("weight"));
  const date = String(formData.get("date") || todayISO());
  if (!(weight >= 20 && weight <= 400)) return { error: "Enter a weight between 20 and 400." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("weight_entries").upsert({ user_id: user.id, date, weight }, { onConflict: "user_id,date" });
  if (error) return { error: "Couldn't save weight." };
  await supabase.from("profiles").update({ current_weight: weight }).eq("id", user.id);
  await supabase.from("daily_logs").upsert({ user_id: user.id, date, weight }, { onConflict: "user_id,date" });
  revalidatePath("/profile"); revalidatePath("/dashboard");
  return { message: "Weight logged." };
}

export async function updateProfile(_: unknown, formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const height = Number(formData.get("height_cm"));
  const { error } = await supabase.from("profiles").update({ name: name || null, height_cm: height > 0 ? height : null }).eq("id", user.id);
  if (error) return { error: "Couldn't update profile." };
  revalidatePath("/profile");
  return { message: "Profile updated." };
}

export async function regenerateHealthToken() {
  const { supabase, user } = await requireUser();
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  await supabase.from("health_integrations").update({ ingest_token: token, connected: false }).eq("user_id", user.id);
  revalidatePath("/profile");
}

export async function deleteAccountData() {
  const { supabase, user } = await requireUser();
  // RLS-scoped deletes; auth user itself is deleted via Supabase dashboard or a service-role admin route.
  for (const t of ["food_logs", "workouts", "activities", "weight_entries", "daily_logs"]) await supabase.from(t).delete().eq("user_id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}
