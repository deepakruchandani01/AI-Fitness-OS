import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeHealthPayload } from "@/lib/apple-health/normalize";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/apple-health/webhook?token=<per-user token>
 * Called by Health Auto Export directly, or by Pipedream forwarding the payload.
 * Optional extra shared secret: header  x-webhook-secret: $APPLE_HEALTH_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? req.headers.get("x-ingest-token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });
  const shared = process.env.APPLE_HEALTH_WEBHOOK_SECRET;
  if (shared && req.headers.get("x-webhook-secret") !== shared) {
    return NextResponse.json({ error: "Bad secret" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data: integ } = await admin.from("health_integrations").select("user_id").eq("ingest_token", token).maybeSingle();
  if (!integ) return NextResponse.json({ error: "Unknown token" }, { status: 401 });
  const userId = integ.user_id as string;

  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "Body must be JSON" }, { status: 400 }); }

  // Always keep the raw payload so the real structure can be inspected later.
  await admin.from("health_records").insert({ user_id: userId, record_type: "raw_payload", record_date: new Date().toISOString().slice(0, 10), payload });

  try {
    const n = normalizeHealthPayload(payload);
    for (const d of Object.values(n.days)) {
      // Upsert daily log; Apple Health values REPLACE prior AH values for that day (HAE re-sends full days).
      await admin.from("daily_logs").upsert(
        { user_id: userId, date: d.date, steps: d.steps, active_calories: d.active_calories },
        { onConflict: "user_id,date" }
      );
      await admin.from("health_records").insert([
        { user_id: userId, record_type: "steps", record_date: d.date, normalized_value: d.steps, unit: "count" },
        { user_id: userId, record_type: "active_energy", record_date: d.date, normalized_value: d.active_calories, unit: "kcal" },
      ]);
    }
    if (n.workouts.length) {
      await admin.from("workouts").upsert(
        n.workouts.map((w) => ({
          user_id: userId, date: w.date, source: "apple_health", workout_type: w.workout_type,
          duration_minutes: w.duration_minutes, calories_burned: w.calories_burned,
          apple_health_id: w.apple_health_id, started_at: w.started_at, ended_at: w.ended_at,
        })),
        { onConflict: "user_id,apple_health_id" }
      );
    }
    await admin.from("health_integrations").update({ connected: true, last_synced_at: new Date().toISOString() }).eq("user_id", userId);
    await admin.from("health_syncs").insert({ user_id: userId, status: n.recordCount ? "success" : "partial", records_imported: n.recordCount,
      error_message: n.recordCount ? null : "Payload received but no recognized metrics found; raw payload stored for inspection." });
    return NextResponse.json({ ok: true, imported: n.recordCount, days: Object.keys(n.days).length, workouts: n.workouts.length });
  } catch (e: any) {
    await admin.from("health_syncs").insert({ user_id: userId, status: "failed", error_message: String(e?.message ?? e) });
    return NextResponse.json({ error: "Failed to process payload" }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ ok: true, message: "AI Fitness OS Apple Health ingestion endpoint. POST JSON here." }); }
