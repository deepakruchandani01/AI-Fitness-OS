"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn } from "@/services/authService";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, Input, Notice } from "@/components/ui/input";

function Submit() { const { pending } = useFormStatus(); return <button className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>; }

export default function SignIn() {
  const [state, action] = useFormState(signIn, null as any);
  return (
    <AuthShell title="Welcome back" footer={<>New here? <Link href="/auth/sign-up" className="font-medium text-ink underline-offset-4 hover:underline">Create your account</Link></>}>
      <form action={action} className="space-y-4">
        <Field label="Email"><Input name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password"><Input name="password" type="password" autoComplete="current-password" required /></Field>
        {state?.error && <Notice kind="error">{state.error}</Notice>}
        <Submit />
      </form>
    </AuthShell>
  );
}
