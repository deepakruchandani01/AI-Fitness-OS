"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } });
  if (error) return { error: error.message };
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
