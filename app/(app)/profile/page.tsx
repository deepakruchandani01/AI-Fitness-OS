import { formatDistanceToNow } from "date-fns";
import { requireUser } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/card";
import { WeightForm, ProfileForm, RegenerateTokenButton } from "@/components/profile/ProfileForms";
import { CopyField } from "@/components/profile/CopyField";
import { WeightChart } from "@/components/analytics/Charts";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: goals }, { data: weights }, { data: integ }, { data: syncs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("goals").select("target_weight").eq("user_id", user.id).single(),
    supabase.from("weight_entries").select("date, weight").eq("user_id", user.id).order("date", { ascending: true }).limit(90),
    supabase.from("health_integrations").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("health_syncs").select("sync_time, status, records_imported, error_message").eq("user_id", user.id).order("sync_time", { ascending: false }).limit(3),
  ]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://YOUR-APP.vercel.app";
  const webhook = `${appUrl}/api/apple-health/webhook?token=${integ?.ingest_token ?? ""}`;
  const latest = weights?.at(-1)?.weight ?? profile?.current_weight;
  const weekAgo = weights?.find((w: any) => new Date(w.date) <= new Date(Date.now() - 7 * 864e5));

  return (
    <div className="space-y-6">
      <header><h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1><p className="mt-1 text-ink-2">{profile?.email}</p></header>

      <Card><CardTitle>Account</CardTitle><ProfileForm profile={profile} /></Card>

      <div id="weight"><Card>
        <CardTitle>Weight</CardTitle>
        <div className="mb-5 grid grid-cols-3 gap-4">
          <div><p className="eyebrow">Current</p><p className="num font-display text-2xl font-semibold">{latest ?? "—"} <span className="text-sm font-normal text-ink-3">kg</span></p></div>
          <div><p className="eyebrow">Goal</p><p className="num font-display text-2xl font-semibold">{goals?.target_weight ?? "—"} <span className="text-sm font-normal text-ink-3">kg</span></p></div>
          <div><p className="eyebrow">7-day trend</p><p className="num font-display text-2xl font-semibold">{latest && weekAgo ? `${latest - weekAgo.weight > 0 ? "+" : ""}${(latest - weekAgo.weight).toFixed(1)}` : "—"} <span className="text-sm font-normal text-ink-3">kg</span></p></div>
        </div>
        {weights && weights.length > 1 ? <WeightChart data={weights as any} target={goals?.target_weight ?? null} /> : <p className="mb-4 text-sm text-ink-3">Log a few days and your trend line appears here. Daily numbers wobble — we&apos;ll talk in trends, not single readings.</p>}
        <div className="mt-4"><WeightForm /></div>
      </Card></div>

      <div id="apple-health"><Card>
        <CardTitle action={<span className={`rounded-full px-2.5 py-1 text-xs ${integ?.connected ? "bg-sage-soft text-sage" : "bg-line/60 text-ink-3"}`}>{integ?.connected ? "Connected" : "Not connected"}</span>}>Apple Health</CardTitle>
        <p className="text-sm text-ink-2">{integ?.last_synced_at ? `Last synced ${formatDistanceToNow(new Date(integ.last_synced_at))} ago.` : "Waiting for the first sync from your iPhone."}</p>
        <ol className="mt-4 space-y-2 text-sm text-ink-2">
          <li><b className="text-ink">1.</b> On your iPhone, open <b>Health Auto Export</b> → Automations → New → REST API.</li>
          <li><b className="text-ink">2.</b> Paste this URL as the endpoint (it&apos;s unique to you — treat it like a password):</li>
        </ol>
        <div className="mt-2"><CopyField value={webhook} /></div>
        <ol start={3} className="mt-2 space-y-2 text-sm text-ink-2">
          <li><b className="text-ink">3.</b> Method POST · format JSON · select Steps, Active Energy and Workouts · aggregate Daily · run automatically.</li>
          <li><b className="text-ink">4.</b> Tap &quot;Run now&quot; once. This page will show Connected within a minute.</li>
          <li className="text-ink-3">Using Pipedream instead? Add an HTTP step that forwards <code>steps.trigger.event.body</code> to the URL above.</li>
        </ol>
        {syncs?.length ? <ul className="mt-4 divide-y divide-line/70 text-xs text-ink-2">{syncs.map((s: any, i: number) => <li key={i} className="flex justify-between py-1.5"><span>{formatDistanceToNow(new Date(s.sync_time))} ago · {s.status}{s.error_message ? ` — ${s.error_message}` : ""}</span><span className="num">{s.records_imported} records</span></li>)}</ul> : null}
        <div className="mt-4"><RegenerateTokenButton /></div>
        <p className="mt-3 text-xs text-ink-3">If a sync fails, your manually entered data is still safe.</p>
      </Card></div>
    </div>
  );
}
