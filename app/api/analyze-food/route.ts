import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFoodImage } from "@/lib/ai/analyzeFood";

export const runtime = "nodejs";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "No image provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG or WEBP photo" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is larger than 8 MB" }, { status: 400 });

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await analyzeFoodImage(base64, file.type);
    return NextResponse.json({ result });
  } catch (e) {
    console.error("analyze-food failed", e);
    return NextResponse.json({ error: "Couldn't confidently analyze this meal. You can enter the calories manually." }, { status: 502 });
  }
}
