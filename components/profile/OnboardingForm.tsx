"use client";
import { useFormState, useFormStatus } from "react-dom";
import { completeOnboarding } from "@/services/profileService";
import { Field, Input, Notice } from "@/components/ui/input";

function Submit() { const { pending } = useFormStatus(); return <button className="btn-primary w-full" disabled={pending}>{pending ? "Saving…" : "Go to my dashboard"}</button>; }

export function OnboardingForm() {
  const [state, action] = useFormState(completeOnboarding, null as any);
  return (
    <form action={action} className="space-y-4">
      <Field label="Name"><Input name="name" required autoComplete="given-name" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Age"><Input name="age" type="number" min={5} max={120} required /></Field>
        <Field label="Gender" hint="optional"><select name="gender" className="field"><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option></select></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Height (cm)"><Input name="height_cm" type="number" step="0.1" min={80} max={260} required /></Field>
        <Field label="Current weight (kg)"><Input name="current_weight" type="number" step="0.1" min={20} max={400} required /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Target weight (kg)"><Input name="target_weight" type="number" step="0.1" min={20} max={400} required /></Field>
        <Field label="Fitness level" hint="optional"><select name="fitness_level" className="field"><option value="">Skip</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Daily calorie goal"><Input name="daily_calorie_goal" type="number" defaultValue={2000} min={800} max={8000} required /></Field>
        <Field label="Daily step goal"><Input name="daily_step_goal" type="number" defaultValue={10000} min={500} max={100000} required /></Field>
      </div>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <Submit />
    </form>
  );
}
