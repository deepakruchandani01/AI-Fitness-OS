import { cn } from "@/lib/utils";
export function Bar({ pct, color = "bg-sage", className }: { pct: number; color?: string; className?: string }) {
  return <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line", className)}><div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${Math.min(100, pct)}%` }} /></div>;
}
