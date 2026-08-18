"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check } from "lucide-react";
import { deleteFoodLog, updateFoodLog } from "@/services/foodService";
import { fmt } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { FoodLog } from "@/types/database";

export function FoodList({ items }: { items: FoodLog[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [vals, setVals] = useState<{ food_name: string; calories: string }>({ food_name: "", calories: "" });
  const [, start] = useTransition();
  const groups = ["breakfast", "lunch", "snack", "dinner"] as const;
  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const rows = items.filter((i) => i.meal_type === g); if (!rows.length) return null;
        return (
          <div key={g}>
            <div className="mb-1 flex items-baseline justify-between"><p className="eyebrow">{g}</p><p className="num text-xs text-ink-3">{fmt(rows.reduce((s, r) => s + r.calories, 0))} kcal</p></div>
            <ul className="divide-y divide-line/70">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5 text-sm">
                  {editing === r.id ? (
                    <><Input value={vals.food_name} onChange={(e) => setVals({ ...vals, food_name: e.target.value })} className="py-1.5" />
                      <Input type="number" value={vals.calories} onChange={(e) => setVals({ ...vals, calories: e.target.value })} className="w-24 py-1.5" />
                      <button className="btn-ghost p-2" onClick={() => start(async () => { await updateFoodLog(r.id, { food_name: vals.food_name, calories: vals.calories }); setEditing(null); router.refresh(); })}><Check size={16} /></button></>
                  ) : (
                    <><span className="flex-1"><span className="font-medium">{r.food_name}</span>{r.portion && <span className="text-ink-3"> · {r.portion}</span>}{r.ai_confidence && <span className="ml-2 rounded-full bg-sky-soft px-1.5 py-0.5 text-[10px] text-sky">AI est.</span>}</span>
                      <span className="num text-ink-2">{fmt(r.calories)} kcal</span>
                      <button className="btn-ghost p-2" aria-label="Edit" onClick={() => { setEditing(r.id); setVals({ food_name: r.food_name, calories: String(r.calories) }); }}><Pencil size={15} /></button>
                      <button className="btn-ghost p-2 text-rose" aria-label="Delete" onClick={() => start(async () => { await deleteFoodLog(r.id); router.refresh(); })}><Trash2 size={15} /></button></>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
