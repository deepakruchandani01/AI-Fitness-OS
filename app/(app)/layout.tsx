import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { Sidebar, BottomNav } from "@/components/layout/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: p } = await supabase.from("profiles").select("onboarding_complete").eq("id", user.id).single();
  if (p && !p.onboarding_complete) redirect("/onboarding");
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 pb-24 pt-6 sm:px-8 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
