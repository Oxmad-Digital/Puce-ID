import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LangToggle } from "@/components/layout/lang-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <LangToggle />
        </div>

        {/* Visuel compact sur mobile */}
        <div className="relative mt-6 h-40 overflow-hidden rounded-2xl lg:hidden">
          <Image src="/images/auth.jpg" alt="" fill sizes="100vw" className="object-cover object-[60%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 to-brand-900/10" />
          <p className="absolute bottom-4 left-4 text-base font-bold text-white">Chaque animal retrouve son chemin.</p>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="flex flex-col gap-2 text-[11px] text-subtle sm:flex-row sm:justify-between">
          <span>© 2026 Puce ID</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-brand-700">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-brand-700">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-brand-700">CGU</Link>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/auth.jpg" alt="Un chien heureux sur la plage" fill priority sizes="50vw" className="object-cover object-[65%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/30 to-brand-900/5" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-sm text-2xl font-bold leading-tight">Chaque animal retrouve son chemin.</p>
          <ul className="mt-5 space-y-2 text-sm text-white/80">
            {[
              "Puce ISO à 15 chiffres, recherche gratuite",
              "Contact anonyme avec le propriétaire",
              "Historique de propriété sécurisé",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-500">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
