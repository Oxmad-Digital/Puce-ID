import Link from "next/link";
import { Logo } from "./logo";

const columns = [
  {
    title: "Registre",
    links: [
      { label: "Rechercher une puce", href: "/" },
      { label: "Enregistrer un animal", href: "/animaux/nouveau" },
      { label: "Déclarer perdu / trouvé", href: "/perdu-trouve" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Vétérinaires partenaires", href: "/veterinaires" },
      { label: "Questions fréquentes", href: "/faq" },
      { label: "Guide de l'identification", href: "/guide-identification" },
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
                Le registre des animaux identifiés par puce électronique à Madagascar.
              </p>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-white">{col.title}</p>
                <ul className="mt-3 space-y-2 text-xs">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold text-white">Contact</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="mailto:contact@pawsafe.mg" className="hover:text-white">
                    contact@pawsafe.mg
                  </a>
                </li>
                <li>+261 34 00 000 00</li>
                <li>Antananarivo, Madagascar</li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Formulaire de contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
        {compact && (
          <div className="flex items-center justify-between py-6">
            <Logo inverted variant="accent" />
            <span className="text-xs">Espace réservé aux vétérinaires vérifiés</span>
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PawSafe. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-white">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
