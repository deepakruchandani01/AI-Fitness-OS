"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signUp } from "@/services/authService";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, Input, Notice } from "@/components/ui/input";

function Submit() { const { pending } = useFormStatus(); return <button className="btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create your account"}</button>; }

export default function SignUp() {
  const [state, action] = useFormState(signUp, null as any);
  return (
    <AuthShell title="Build a healthier day, one decision at a time." sub="Create your account to start tracking with photos and Apple Health."
      footer={<>Already have an account? <Link href="/auth/sign-in" className="font-medium text-ink underline-offset-4 hover:underline">Sign in</Link></>}>
      <form action={action} className="space-y-4">
        <Field label="Email"><Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Field>
        <Field label="Password" hint="8+ characters"><Input name="password" type="password" autoComplete="new-password" minLength={8} required /></Field>
        <Field label="Confirm password"><Input name="confirm" type="password" autoComplete="new-password" minLength={8} required /></Field>
        {state?.error && <Notice kind="error">{state.error}</Notice>}
        {state?.message && <Notice kind="success">{state.message}</Notice>}
        <Submit />
      </form>
    </AuthShell>
  );
}
