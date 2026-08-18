import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/profile/OnboardingForm";

export default async function Onboarding() {
  const { supabase, user } = await requireUser();
  const { data: p } = await supabase.from("profiles").select("onboarding_complete").eq("id", user.id).single();
  if (p?.onboarding_complete) redirect("/dashboard");
  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <p className="eyebrow">A minute of setup</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Tell us a little about you</h1>
      <p className="mt-2 text-ink-2">Used only to personalise goals and calorie estimates. You can change anything later.</p>
      <div className="card mt-8 p-6"><OnboardingForm /></div>
    </main>
  );
}
