"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  FileClock,
  LayoutDashboard,
  MapPin,
  PawPrint,
  Plus,
  ScanLine,
  Settings,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { T } from "./lang-toggle";
import type { NavIcon, NavItem } from "./nav-config";

const ICONS: Record<NavIcon, typeof Bell> = {
  dashboard: LayoutDashboard,
  paw: PawPrint,
  transfer: ArrowLeftRight,
  pin: MapPin,
  settings: Settings,
  scan: ScanLine,
  plus: Plus,
  upload: Upload,
  log: FileClock,
  shield: ShieldCheck,
  clinic: Building2,
  bell: Bell,
};

function useActive() {
  const pathname = usePathname();
  return (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

/** Navigation latérale (desktop). */
export function Sidebar({ items }: { items: NavItem[] }) {
  const isActive = useActive();
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
              active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon className="size-4" strokeWidth={1.8} />
            <T {...item.label} />
          </Link>
        );
      })}
    </nav>
  );
}

/** Navigation en pastilles (tablette / mobile). */
export function TabNav({ items }: { items: NavItem[] }) {
  const isActive = useActive();
  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            isActive(item)
              ? "bg-brand-600 text-white"
              : "bg-white text-muted ring-1 ring-line hover:text-brand-700",
          )}
        >
          <T {...item.label} />
        </Link>
      ))}
    </nav>
  );
}
