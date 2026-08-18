"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveFoodLog } from "@/services/foodService";
import type { FoodAnalysis } from "@/lib/validation/food";
import { Field, Input, Notice } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import type { MealType } from "@/types/database";

type Draft = { food_name: string; portion: string; calories: string; protein: string; carbs: string; fat: string; fiber: string; ai_confidence: "low" | "medium" | "high" | null };
const empty: Draft = { food_name: "", portion: "", calories: "", protein: "", carbs: "", fat: "", fiber: "", ai_confidence: null };

function guessMeal(): MealType { const h = new Date().getHours(); return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 18 ? "snack" : "dinner"; }

export function FoodLogger({ userId, date, open, onClose }: { userId: string; date: string; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [meal, setMeal] = useState<MealType>(guessMeal());
  const [pending, start] = useTransition();

  if (!open) return null;

  const pick = (f: File | null) => { setFile(f); setPreview(f ? URL.createObjectURL(f) : null); setError(null); };

  async function analyze() {
    if (!file) return;
    setAnalyzing(true); setError(null);
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await fetch("/api/analyze-food", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      const r: FoodAnalysis = json.result;
      setDraft({ food_name: r.food_name, portion: r.estimated_portion, calories: String(Math.round(r.calories)), protein: String(r.protein_g), carbs: String(r.carbs_g), fat: String(r.fat_g), fiber: String(r.fiber_g), ai_confidence: r.confidence });
    } catch (e: any) { setError(e.message ?? "Couldn't confidently analyze this meal. You can enter the calories manually."); }
    finally { setAnalyzing(false); }
  }

  function save() {
    setError(null);
    start(async () => {
      let image_url: string | null = null;
      if (file) {
        const supabase = createClient();
        const path = `${userId}/${date}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("food-images").upload(path, file, { contentType: file.type });
        if (upErr) { setError("Photo upload failed; saving the meal without it."); } else image_url = path;
      }
      const res = await saveFoodLog({ date, meal_type: meal, food_name: draft.food_name, portion: draft.portion || null, calories: draft.calories, protein: draft.protein || 0, carbs: draft.carbs || 0, fat: draft.fat || 0, fiber: draft.fiber || 0, ai_confidence: draft.ai_confidence, image_url });
      if (res?.error) { setError(res.error); return; }
      setDraft(empty); pick(null); onClose(); router.refresh();
    });
  }

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-card sm:rounded-2xl sm:p-6 animate-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Log a meal</h2><button onClick={onClose} className="btn-ghost p-2" aria-label="Close"><X size={18} /></button></div>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
        {preview ? (
          <div className="relative overflow-hidden rounded-xl"><img src={preview} alt="Your meal" className="aspect-[4/3] w-full object-cover" />
            <button type="button" onClick={() => pick(null)} className="absolute right-2 top-2 rounded-full bg-ink/60 p-1.5 text-white"><X size={14} /></button></div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line py-10 text-ink-2 hover:bg-canvas">
            <Camera size={24} /><span className="text-sm font-medium">Take or choose a photo</span><span className="text-xs text-ink-3">or skip and type it below</span>
          </button>
        )}
        {preview && !draft.food_name && (
          <button type="button" onClick={analyze} disabled={analyzing} className="btn-primary mt-3 w-full"><Sparkles size={16} />{analyzing ? "Analyzing your meal…" : "Estimate calories with AI"}</button>
        )}
        {analyzing && <div className="mt-3 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-9 animate-pulse rounded-xl bg-line/60" />)}</div>}

        {!analyzing && (
          <div className="mt-4 space-y-3">
            {draft.ai_confidence && <Notice kind="info">AI estimate · {draft.ai_confidence} confidence. Portion sizes from photos are approximate — adjust anything below.</Notice>}
            <div><p className="mb-1.5 text-[13px] font-medium text-ink-2">Meal</p>
              <Segmented value={meal} onChange={setMeal} options={[{ value: "breakfast", label: "Breakfast" }, { value: "lunch", label: "Lunch" }, { value: "dinner", label: "Dinner" }, { value: "snack", label: "Snack" }]} /></div>
            <Field label="Food"><Input value={draft.food_name} onChange={set("food_name")} placeholder="e.g. Chicken biryani" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Portion"><Input value={draft.portion} onChange={set("portion")} placeholder="1 plate" /></Field>
              <Field label="Calories (kcal)"><Input type="number" inputMode="numeric" value={draft.calories} onChange={set("calories")} /></Field>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["protein", "carbs", "fat", "fiber"] as const).map((k) => <Field key={k} label={k[0].toUpperCase() + k.slice(1) + " g"}><Input type="number" inputMode="decimal" value={draft[k]} onChange={set(k)} /></Field>)}
            </div>
            {error && <Notice kind="error">{error}</Notice>}
            <button onClick={save} disabled={pending || !draft.food_name || draft.calories === ""} className="btn-primary w-full">{pending ? "Saving…" : "Save meal"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
