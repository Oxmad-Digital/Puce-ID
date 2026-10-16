import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LangToggle, T } from "@/components/layout/lang-toggle";
import { fileHref } from "@/lib/utils";
import siteImages from "@/lib/site-images.json";

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
          <Image src={fileHref(siteImages.auth)!} alt="" fill unoptimized sizes="100vw" className="object-cover object-[60%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 to-brand-900/10" />
          <p className="absolute bottom-4 left-4 text-base font-bold text-white">
            <T fr="Chaque animal retrouve son chemin." mg="Mahita ny lalany hody ny biby tsirairay." />
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="flex flex-col gap-2 text-[11px] text-subtle sm:flex-row sm:justify-between">
          <span>© 2026 Puce ID</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-brand-700">
              <T fr="Mentions légales" mg="Fampahalalana ara-dalàna" />
            </Link>
            <Link href="/confidentialite" className="hover:text-brand-700">
              <T fr="Confidentialité" mg="Tsiambaratelo" />
            </Link>
            <Link href="/cgu" className="hover:text-brand-700">
              <T fr="CGU" mg="Fepetra fampiasana" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Image src={fileHref(siteImages.auth)!} alt="Un chien heureux sur la plage" fill unoptimized loading="eager" sizes="50vw" className="object-cover object-[65%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/30 to-brand-900/5" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-sm text-2xl font-bold leading-tight">
            <T fr="Chaque animal retrouve son chemin." mg="Mahita ny lalany hody ny biby tsirairay." />
          </p>
          <ul className="mt-5 space-y-2 text-sm text-white/80">
            {[
              { fr: "Puce ISO à 15 chiffres, recherche gratuite", mg: "Puce ISO misy isa 15, fikarohana maimaim-poana" },
              { fr: "Contact anonyme avec le propriétaire", mg: "Fifandraisana tsy mampiseho anarana amin'ny tompony" },
              { fr: "Historique de propriété sécurisé", mg: "Tantaran'ny fananana voaaro" },
            ].map((t) => (
              <li key={t.fr} className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-500">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <T {...t} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
