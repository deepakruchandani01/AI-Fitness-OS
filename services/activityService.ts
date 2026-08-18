"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { estimateGymCalories, estimateActivityCalories, type Intensity } from "@/lib/calculations/calories";
import { todayISO } from "@/lib/utils";

async function recomputeBurn(supabase: any, userId: string, date: string) {
  const [{ data: w }, { data: a }] = await Promise.all([
    supabase.from("workouts").select("calories_burned").eq("user_id", userId).eq("date", date).eq("source", "manual"),
    supabase.from("activities").select("calories_burned").eq("user_id", userId).eq("date", date),
  ]);
  const workout = (w ?? []).reduce((s: number, r: any) => s + r.calories_burned, 0);
  const other = (a ?? []).reduce((s: number, r: any) => s + r.calories_burned, 0);
  await supabase.from("daily_logs").upsert({ user_id: userId, date, workout_calories: workout, other_activity_calories: other }, { onConflict: "user_id,date" });
}

export async function logGymSession(_: unknown, formData: FormData) {
  const hours = Number(formData.get("hours") || 0), minutes = Number(formData.get("minutes") || 0);
  const total = hours * 60 + minutes;
  const type = String(formData.get("workout_type") || "Mix");
  const intensity = (String(formData.get("intensity") || "moderate") as Intensity);
  const date = String(formData.get("date") || todayISO());
  if (total <= 0 || total > 600) return { error: "Enter a duration between 1 minute and 10 hours." };
  const { supabase, user } = await requireUser();
  const { data: p } = await supabase.from("profiles").select("current_weight").eq("id", user.id).single();
  const cals = estimateGymCalories(type, total, Number(p?.current_weight) || 70, intensity);
  const { error } = await supabase.from("workouts").insert({ user_id: user.id, date, source: "manual", workout_type: type, duration_minutes: total, calories_burned: cals, intensity });
  if (error) return { error: "Couldn't save workout." };
  await supabase.from("daily_logs").upsert({ user_id: user.id, date, gym: true, gym_duration_minutes: total, workout_type: type }, { onConflict: "user_id,date" });
  await recomputeBurn(supabase, user.id, date);
  revalidatePath("/activity"); revalidatePath("/dashboard");
  return { message: `Logged. Estimated burn: ~${cals} kcal` };
}

export async function logActivity(_: unknown, formData: FormData) {
  const name = String(formData.get("activity_name") || "").trim();
  const minutes = Number(formData.get("minutes") || 0);
  const intensity = (String(formData.get("intensity") || "moderate") as Intensity);
  const date = String(formData.get("date") || todayISO());
  if (!name) return { error: "Name the activity." };
  if (minutes <= 0 || minutes > 600) return { error: "Enter a duration between 1 and 600 minutes." };
  const { supabase, user } = await requireUser();
  const { data: p } = await supabase.from("profiles").select("current_weight").eq("id", user.id).single();
  const cals = estimateActivityCalories(name, minutes, Number(p?.current_weight) || 70, intensity);
  const { error } = await supabase.from("activities").insert({ user_id: user.id, date, activity_name: name, duration_minutes: minutes, intensity, calories_burned: cals });
  if (error) return { error: "Couldn't save activity." };
  await recomputeBurn(supabase, user.id, date);
  revalidatePath("/activity"); revalidatePath("/dashboard");
  return { message: `Logged. Estimated burn: ~${cals} kcal` };
}

export async function deleteWorkout(id: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id).select("date").single();
  if (data) await recomputeBurn(supabase, user.id, data.date);
  revalidatePath("/activity"); revalidatePath("/dashboard");
}
export async function deleteActivity(id: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("activities").delete().eq("id", id).eq("user_id", user.id).select("date").single();
  if (data) await recomputeBurn(supabase, user.id, data.date);
  revalidatePath("/activity"); revalidatePath("/dashboard");
}
