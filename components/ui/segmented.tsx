"use client";
import { cn } from "@/lib/utils";
export function Segmented<T extends string>({ value, onChange, options, name }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; name?: string }) {
  return (
    <div role="radiogroup" className="inline-flex rounded-xl bg-line/60 p-1">
      {name && <input type="hidden" name={name} value={value} />}
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-lg px-4 py-1.5 text-sm font-medium transition", value === o.value ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink-2")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
