"use client";
import { useFormState, useFormStatus } from "react-dom";
import { logWeight, updateProfile, regenerateHealthToken } from "@/services/profileService";
import { signOut } from "@/services/authService";
import { Field, Input, Notice } from "@/components/ui/input";
import { todayISO } from "@/lib/utils";

function Submit({ label }: { label: string }) { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : label}</button>; }

export function WeightForm() {
  const [state, action] = useFormState(logWeight, null as any);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <Field label="Weight (kg)"><Input name="weight" type="number" step="0.1" min={20} max={400} required className="w-32" /></Field>
      <Field label="Date"><Input name="date" type="date" defaultValue={todayISO()} className="w-44" /></Field>
      <Submit label="Log weight" />
      {state?.error && <Notice kind="error">{state.error}</Notice>}{state?.message && <Notice kind="success">{state.message}</Notice>}
    </form>
  );
}
export function ProfileForm({ profile }: { profile: any }) {
  const [state, action] = useFormState(updateProfile, null as any);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Name"><Input name="name" defaultValue={profile?.name ?? ""} /></Field><Field label="Height (cm)"><Input name="height_cm" type="number" step="0.1" defaultValue={profile?.height_cm ?? ""} /></Field></div>
      {state?.error && <Notice kind="error">{state.error}</Notice>}{state?.message && <Notice kind="success">{state.message}</Notice>}
      <div className="flex gap-3"><Submit label="Save profile" /><button formAction={signOut} className="btn-secondary">Sign out</button></div>
    </form>
  );
}
export function RegenerateTokenButton() {
  return <form action={regenerateHealthToken}><button className="btn-secondary text-[13px]">Generate a new link (revokes the old one)</button></form>;
}
