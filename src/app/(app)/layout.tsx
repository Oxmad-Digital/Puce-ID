import { Suspense } from "react";
import Link from "next/link";
import { BadgeCheck, Bell, CircleHelp } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Badge, Skeleton } from "@/components/ui";
import { Logo } from "@/components/layout/logo";
import { LangToggle } from "@/components/layout/lang-toggle";
import { NAV } from "@/components/layout/nav-config";
import { Sidebar, TabNav } from "@/components/layout/app-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { PublicFooter } from "@/components/layout/public-footer";

/** Pages dépendantes de la session / de la base : navigation bloquante assumée (streaming via loading.tsx). */
export const instant = false;

const ROLE_LABEL = { owner: "Propriétaire", vet: "Vétérinaire", admin: "Administrateur" } as const;

async function HeaderAccount() {
  const user = await requireUser();
  const isVet = user.role === "vet";
  return (
    <>
      {isVet && user.vet?.status === "verified" && (
        <Badge tone="brand" className="hidden md:inline-flex">
          <BadgeCheck className="size-3" /> Vétérinaire vérifié
        </Badge>
      )}
      {isVet && user.vet?.status === "pending" && (
        <Badge tone="amber" className="hidden md:inline-flex">
          Vérification en cours
        </Badge>
      )}
      <UserMenu
        name={isVet ? `Dr ${user.name.split(" ").at(-1)}` : user.name}
        subtitle={isVet ? (user.vet?.clinicName ?? "Vétérinaire") : ROLE_LABEL[user.role]}
        tone={isVet ? "accent" : "brand"}
      />
    </>
  );
}

async function Navigation({ variant }: { variant: "sidebar" | "tabs" }) {
  const user = await requireUser();
  const items = NAV[user.role];
  return variant === "sidebar" ? <Sidebar items={items} /> : <TabNav items={items} />;
}

function SidebarFallback() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2 sm:gap-4">
            <LangToggle />
            <Link
              href="/faq"
              className="hidden items-center gap-1 text-xs font-medium text-muted hover:text-brand-700 sm:flex"
            >
              <CircleHelp className="size-4" /> Aide
            </Link>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-brand-700"
            >
              <Bell className="size-4" /> <span className="hidden sm:inline">Notifications</span>
            </Link>
            <Suspense fallback={<Skeleton className="h-8 w-32" />}>
              <HeaderAccount />
            </Suspense>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 bg-brand-900 lg:block">
          <div className="sticky top-14">
            <Suspense fallback={<SidebarFallback />}>
              <Navigation variant="sidebar" />
            </Suspense>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 lg:hidden">
            <Suspense fallback={<Skeleton className="h-8" />}>
              <Navigation variant="tabs" />
            </Suspense>
          </div>
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
