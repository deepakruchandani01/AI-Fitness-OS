"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, Activity, BarChart3, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/food", label: "Food", icon: Utensils },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target, desktopOnly: true },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-line/70 px-4 py-6">
      <Link href="/dashboard" className="px-2 font-display font-semibold tracking-tight">AI Fitness OS</Link>
      <nav className="mt-8 space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", path.startsWith(href) ? "bg-ink text-white" : "text-ink-2 hover:bg-ink/5")}>
            <Icon size={17} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-surface/90 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-5">
        {items.filter((i) => !i.desktopOnly).map(({ href, label, icon: Icon }) => (
          <li key={href}><Link href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", path.startsWith(href) ? "text-ink" : "text-ink-3")}><Icon size={20} strokeWidth={path.startsWith(href) ? 2.4 : 1.8} />{label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}
