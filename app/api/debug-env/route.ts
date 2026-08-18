// TEMPORARY diagnostic endpoint — remove after debugging.
// Reports lengths and positions of any non-Latin1 characters in env vars.
// Does NOT expose secret values (preview only for public vars).
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function scan(name: string) {
  const v = process.env[name] ?? "";
  const badChars: { index: number; code: number }[] = [];
  for (let i = 0; i < v.length; i++) {
    const c = v.charCodeAt(i);
    if (c > 255) badChars.push({ index: i, code: c });
  }
  return {
    name,
    length: v.length,
    badChars: badChars.slice(0, 10),
    preview: name.startsWith("NEXT_PUBLIC") ? v.slice(0, 24) : `<hidden, ${v.length} chars>`,
  };
}

export async function GET() {
  return NextResponse.json({
    vars: [
      scan("NEXT_PUBLIC_SUPABASE_URL"),
      scan("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      scan("SUPABASE_SERVICE_ROLE_KEY"),
      scan("OPENAI_API_KEY"),
      scan("OPENAI_VISION_MODEL"),
      scan("NEXT_PUBLIC_APP_URL"),
      scan("APPLE_HEALTH_WEBHOOK_SECRET"),
    ],
  });
}
