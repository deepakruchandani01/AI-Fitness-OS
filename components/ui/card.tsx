import { cn } from "@/lib/utils";
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("card p-5 sm:p-6", className)}>{children}</section>;
}
export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-[17px] font-semibold tracking-tight">{children}</h2>{action}</div>;
}
export function Empty({ title, body, cta }: { title: string; body?: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <p className="font-display font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-ink-3">{body}</p>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
