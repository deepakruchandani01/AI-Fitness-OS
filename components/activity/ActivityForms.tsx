"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { logGymSession, logActivity } from "@/services/activityService";
import { Segmented } from "@/components/ui/segmented";
import { Field, Input, Notice } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

function Submit({ label }: { label: string }) { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : label}</button>; }
type Int = "light" | "moderate" | "vigorous";
const intensities: { value: Int; label: string }[] = [{ value: "light", label: "Light" }, { value: "moderate", label: "Moderate" }, { value: "vigorous", label: "Vigorous" }];

export function GymForm({ date }: { date: string }) {
  const [went, setWent] = useState<"yes" | "no">("no");
  const [type, setType] = useState("Mix");
  const [intensity, setIntensity] = useState<Int>("moderate");
  const [state, action] = useFormState(logGymSession, null as any);
  return (
    <Card>
      <CardTitle>Did you go to the gym today?</CardTitle>
      <Segmented value={went} onChange={setWent} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
      {went === "yes" && (
        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="date" value={date} /><input type="hidden" name="workout_type" value={type} /><input type="hidden" name="intensity" value={intensity} />
          <div><p className="mb-1.5 text-[13px] font-medium text-ink-2">Duration</p>
            <div className="flex items-center gap-2"><Input name="hours" type="number" min={0} max={10} defaultValue={1} className="w-20" /><span className="text-sm text-ink-3">h</span><Input name="minutes" type="number" min={0} max={59} defaultValue={0} className="w-20" /><span className="text-sm text-ink-3">min</span></div></div>
          <div><p className="mb-1.5 text-[13px] font-medium text-ink-2">What did you train?</p>
            <div className="flex flex-wrap gap-2">{["Upper Body", "Lower Body + Legs", "Abs & Core", "Mix"].map((t) => <button type="button" key={t} onClick={() => setType(t)} className={`rounded-full border px-3.5 py-1.5 text-sm transition ${type === t ? "border-ink bg-ink text-white" : "border-line hover:bg-canvas"}`}>{t}</button>)}</div></div>
          <div><p className="mb-1.5 text-[13px] font-medium text-ink-2">Intensity <span className="font-normal text-ink-3">— used for the estimate</span></p><Segmented value={intensity} onChange={setIntensity} options={intensities} /></div>
          {state?.error && <Notice kind="error">{state.error}</Notice>}{state?.message && <Notice kind="success">{state.message}</Notice>}
          <Submit label="Save workout" />
        </form>
      )}
    </Card>
  );
}

export function OtherActivityForm({ date }: { date: string }) {
  const [intensity, setIntensity] = useState<Int>("moderate");
  const [state, action] = useFormState(logActivity, null as any);
  return (
    <Card>
      <CardTitle>Other activity</CardTitle>
      <form action={action} className="space-y-4">
        <input type="hidden" name="date" value={date} /><input type="hidden" name="intensity" value={intensity} />
        <Field label="Activity"><Input name="activity_name" list="activities" placeholder="Dance, yoga, cycling, badminton…" required /><datalist id="activities">{["Walking", "Running", "Cycling", "Swimming", "Yoga", "Dance", "Kickboxing", "Hiking", "Badminton", "Tennis"].map((a) => <option key={a} value={a} />)}</datalist></Field>
        <div className="grid grid-cols-2 gap-4"><Field label="Duration (min)"><Input name="minutes" type="number" min={1} max={600} required /></Field>
          <div><p className="mb-1.5 text-[13px] font-medium text-ink-2">Intensity</p><Segmented value={intensity} onChange={setIntensity} options={intensities} /></div></div>
        {state?.error && <Notice kind="error">{state.error}</Notice>}{state?.message && <Notice kind="success">{state.message}</Notice>}
        <Submit label="Add activity" />
      </form>
    </Card>
  );
}
