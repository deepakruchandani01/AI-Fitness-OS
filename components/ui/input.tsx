import * as React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("field", className)} {...props} />
));
Input.displayName = "Input";
export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink-2">{children}{hint && <span className="text-ink-3 font-normal">{hint}</span>}</label>;
}
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div><Label hint={hint}>{label}</Label>{children}</div>;
}
export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  const c = kind === "error" ? "bg-rose-soft text-rose" : kind === "success" ? "bg-sage-soft text-sage" : "bg-sky-soft text-sky";
  return <div className={cn("rounded-xl px-3.5 py-2.5 text-sm", c)}>{children}</div>;
}
