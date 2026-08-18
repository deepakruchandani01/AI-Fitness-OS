import Link from "next/link";
import { ArrowRight, Camera, Activity, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between"><span className="font-display font-semibold tracking-tight">AI Fitness OS</span><Link href="/auth/sign-in" className="text-sm text-ink-2 hover:text-ink">Sign in</Link></header>
      <section className="flex flex-1 flex-col justify-center py-16">
        <p className="eyebrow">Your health. Your data. Your AI coach.</p>
        <h1 className="mt-4 max-w-2xl font-display text-[44px] font-semibold leading-[1.02] tracking-tight sm:text-[64px]">Build a healthier day, one decision at a time.</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-2">Photograph your meals, let Apple Health fill in the rest, and get one honest daily picture — plus a coach that reads it with you.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth/sign-up" className="btn-primary text-[15px] px-5 py-3">Create your account <ArrowRight size={16} /></Link>
          <Link href="/auth/sign-in" className="btn-secondary text-[15px] px-5 py-3">I already have one</Link>
        </div>
        <ul className="mt-16 grid gap-6 sm:grid-cols-3">
          {[[Camera, "Photo → calories", "Snap a plate. AI estimates the dish, portion and macros; you confirm."], [Activity, "Automatic activity", "Steps, active energy and workouts flow in from Apple Health."], [Sparkles, "A coach that reads your day", "Short, practical nudges from your real numbers — never shame."]].map(([Icon, t, b]: any) => (
            <li key={t} className="card p-5"><Icon size={18} className="text-sage" /><p className="mt-3 font-display font-medium">{t}</p><p className="mt-1 text-sm text-ink-2">{b}</p></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
