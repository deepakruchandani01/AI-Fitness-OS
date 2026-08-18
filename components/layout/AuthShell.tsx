export function AuthShell({ title, sub, children, footer }: { title: string; sub?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <p className="eyebrow">AI Fitness OS</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-ink-2">{sub}</p>}
      <div className="card mt-8 p-6">{children}</div>
      {footer && <p className="mt-6 text-center text-sm text-ink-2">{footer}</p>}
    </main>
  );
}
