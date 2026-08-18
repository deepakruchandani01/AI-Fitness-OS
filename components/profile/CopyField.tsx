"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export function CopyField({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2">
      <code className="min-w-0 flex-1 truncate text-xs">{value}</code>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1500); }} className="btn-ghost p-1.5" aria-label="Copy">{ok ? <Check size={15} className="text-sage" /> : <Copy size={15} />}</button>
    </div>
  );
}
