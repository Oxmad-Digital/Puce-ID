import Link from "next/link";
import { Logo } from "./logo";
import { T } from "./lang-toggle";

const columns = [
  {
    title: { fr: "Registre", mg: "Rejisitra" },
    links: [
      { label: "Rechercher une puce", labelMg: "Hikaroka puce", href: "/" },
      { label: "Enregistrer un animal", labelMg: "Hanoratra biby", href: "/animaux/nouveau" },
      { label: "Déclarer perdu / trouvé", labelMg: "Hanambara very / hita", href: "/perdu-trouve" },
    ],
  },
  {
    title: { fr: "Ressources", mg: "Loharano" },
    links: [
      { label: "Vétérinaires partenaires", labelMg: "Dokotera mpiara-miasa", href: "/veterinaires" },
      { label: "Questions fréquentes", labelMg: "Fanontaniana matetika", href: "/faq" },
      { label: "Guide de l'identification", labelMg: "Torolalana momba ny famantarana", href: "/guide-identification" },
      { label: "À propos", labelMg: "Momba anay", href: "/a-propos" },
    ],
  },
];

export function PublicFooter({ compact }: { compact?: boolean }) {
  return (
    <footer className="bg-brand-900 text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!compact && (
          <div className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Logo inverted variant="accent" />
              <p className="mt-3 max-w-xs text-xs leading-relaxed">
                <T
                  fr="Le registre des animaux identifiés par puce électronique à Madagascar."
                  mg="Ny rejisitry ny biby voamarika amin'ny puce elektronika eto Madagasikara."
                />
              </p>
            </div>
            {columns.map((col) => (
              <div key={col.title.fr}>
                <p className="text-xs font-semibold text-white">
                  <T {...col.title} />
                </p>
                <ul className="mt-3 space-y-2 text-xs">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-white">
                        <T fr={l.label} mg={l.labelMg} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold text-white">
                <T fr="Contact" mg="Fifandraisana" />
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="mailto:contact@puceid.mg" className="hover:text-white">
                    contact@puceid.mg
                  </a>
                </li>
                <li>+261 34 00 000 00</li>
                <li>Antananarivo, Madagascar</li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    <T fr="Formulaire de contact" mg="Taratasy fifandraisana" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
        {compact && (
          <div className="flex items-center justify-between py-6">
            <Logo inverted variant="accent" />
            <span className="text-xs">
              <T fr="Espace réservé aux vétérinaires vérifiés" mg="Natokana ho an'ny dokotera mpitsabo biby voamarina" />
            </span>
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Puce ID. <T fr="Tous droits réservés." mg="Zo rehetra voatokana." />
          </p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-white">
              <T fr="Mentions légales" mg="Fampahalalana ara-dalàna" />
            </Link>
            <Link href="/confidentialite" className="hover:text-white">
              <T fr="Confidentialité" mg="Tsiambaratelo" />
            </Link>
            <Link href="/cgu" className="hover:text-white">
              <T fr="CGU" mg="Fepetra fampiasana" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
