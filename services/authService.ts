"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signUp(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };
  console.error("[DEBUG cookies]", JSON.stringify(cookies().getAll().map(c => ({ name: c.name, len: c.value.length, preview: c.value.slice(0, 40) })), null, 2));
  console.error("[DEBUG env]", JSON.stringify({
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    supabaseUrlLen: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
    anonKeyLen: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20),
  }));
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } });
  if (error) {
    console.error("[DEBUG signUp]", JSON.stringify({ name: error.name, message: error.message, status: (error as any).status, cause: (error as any).cause ? String((error as any).cause) : null, stack: error.stack }, null, 2));
    return { error: error.message };
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { message: "Check your email to confirm your account, then sign in." };
  redirect("/onboarding");
}

export async function signIn(_: unknown, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(), password: String(formData.get("password") ?? "") });
  if (error) return { error: "Email or password is incorrect." };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}
