import { Suspense } from "react";
import { format } from "date-fns";
import { requireUser } from "@/lib/supabase/server";
import { todayISO, fmt } from "@/lib/utils";
import { FoodPageClient } from "@/components/food/FoodPageClient";
export const dynamic = "force-dynamic";

export default async function FoodPage() {
  const { supabase, user } = await requireUser();
  const today = todayISO();
  const [{ data: items }, { data: goals }] = await Promise.all([
    supabase.from("food_logs").select("*").eq("user_id", user.id).eq("date", today).order("created_at"),
    supabase.from("goals").select("daily_calorie_goal").eq("user_id", user.id).single(),
  ]);
  const total = (items ?? []).reduce((s: number, i: any) => s + i.calories, 0);
  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-3xl font-semibold tracking-tight">Food</h1><p className="mt-1 text-ink-2">{format(new Date(), "EEEE, d MMMM")}</p></div>
        <p className="num text-sm text-ink-2"><span className="font-display text-2xl font-semibold text-ink">{fmt(total)}</span> / {fmt(goals?.daily_calorie_goal ?? 2000)} kcal</p>
      </header>
      <Suspense><FoodPageClient userId={user.id} date={today} items={(items ?? []) as any} /></Suspense>
    </div>
  );
}
