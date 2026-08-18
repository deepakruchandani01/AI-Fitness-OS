"use client";
import { useFormState, useFormStatus } from "react-dom";
import { updateGoals } from "@/services/profileService";
import { Field, Input, Notice } from "@/components/ui/input";
function Submit() { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save goals"}</button>; }
export function GoalsForm({ goals }: { goals: any }) {
  const [state, action] = useFormState(updateGoals, null as any);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Daily calorie goal"><Input name="daily_calorie_goal" type="number" defaultValue={goals?.daily_calorie_goal ?? 2000} min={800} max={8000} required /></Field>
        <Field label="Daily step goal"><Input name="daily_step_goal" type="number" defaultValue={goals?.daily_step_goal ?? 10000} min={500} max={100000} required /></Field>
        <Field label="Target weight (kg)"><Input name="target_weight" type="number" step="0.1" defaultValue={goals?.target_weight ?? ""} min={20} max={400} /></Field>
      </div>
      {state?.error && <Notice kind="error">{state.error}</Notice>}{state?.message && <Notice kind="success">{state.message}</Notice>}
      <Submit />
    </form>
  );
}
