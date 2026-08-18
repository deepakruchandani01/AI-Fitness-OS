"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { foodLogInputSchema } from "@/lib/validation/food";

async function recomputeConsumed(supabase: any, userId: string, date: string) {
  const { data } = await supabase.from("food_logs").select("calories").eq("user_id", userId).eq("date", date);
  const total = (data ?? []).reduce((s: number, r: any) => s + (r.calories ?? 0), 0);
  await supabase.from("daily_logs").upsert({ user_id: userId, date, calories_consumed: total }, { onConflict: "user_id,date" });
}

export async function saveFoodLog(input: unknown) {
  const parsed = foodLogInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the meal details." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("food_logs").insert({ ...parsed.data, user_id: user.id });
  if (error) return { error: "Couldn't save this meal." };
  await recomputeConsumed(supabase, user.id, parsed.data.date);
  revalidatePath("/food"); revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateFoodLog(id: string, input: unknown) {
  const parsed = foodLogInputSchema.partial().safeParse(input);
  if (!parsed.success) return { error: "Please check the meal details." };
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("food_logs").update(parsed.data).eq("id", id).eq("user_id", user.id).select("date").single();
  if (error) return { error: "Couldn't update this meal." };
  await recomputeConsumed(supabase, user.id, data.date);
  revalidatePath("/food"); revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteFoodLog(id: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("food_logs").delete().eq("id", id).eq("user_id", user.id).select("date").single();
  if (data) await recomputeConsumed(supabase, user.id, data.date);
  revalidatePath("/food"); revalidatePath("/dashboard");
  return { ok: true };
}
