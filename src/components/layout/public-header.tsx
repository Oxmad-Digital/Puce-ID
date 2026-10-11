import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser, homeFor } from "@/lib/session";
import { ButtonLink } from "@/components/ui";
import { Logo } from "./logo";
import { LangToggle } from "./lang-toggle";
import { MobileMenu } from "./mobile-menu";

const nav = [
  { label: "Rechercher une puce", href: "/" },
  { label: "Vétérinaires", href: "/veterinaires" },
  { label: "Perdu / Trouvé", href: "/perdu-trouve" },
];

async function AccountButton() {
  const user = await getCurrentUser().catch(() => null);
  if (user) {
    return (
      <ButtonLink href={homeFor(user.role)} size="sm">
        Mon espace
      </ButtonLink>
    );
  }
  return (
    <ButtonLink href="/connexion" size="sm">
      Connexion
    </ButtonLink>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-brand-700">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle />
          <div className="hidden sm:block">
            <Suspense
              fallback={
                <ButtonLink href="/connexion" size="sm">
                  Connexion
                </ButtonLink>
              }
            >
              <AccountButton />
            </Suspense>
          </div>
          <MobileMenu items={[...nav, { label: "Connexion", href: "/connexion" }]} />
        </div>
      </div>
    </header>
  );
}
