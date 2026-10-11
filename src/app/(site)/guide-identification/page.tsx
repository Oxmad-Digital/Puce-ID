import { Cpu, FileCheck2, HeartPulse, ScanLine, ShieldCheck, Syringe } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { PageHero } from "@/components/page-hero";

export const metadata = { title: "Guide de l'identification" };

const steps = [
  { icon: Syringe, title: "La pose", text: "Le vétérinaire implante sous la peau, généralement côté gauche du cou, une puce de la taille d'un grain de riz. Le geste est rapide et ne nécessite pas d'anesthésie." },
  { icon: Cpu, title: "Le numéro unique", text: "Chaque puce porte un numéro ISO 11784/11785 de 15 chiffres. Les trois premiers identifient le pays ou le fabricant (450 pour Madagascar)." },
  { icon: FileCheck2, title: "L'enregistrement", text: "Le vétérinaire associe ce numéro à l'animal et à son propriétaire dans le registre Puce ID. Le propriétaire confirme ensuite ses coordonnées." },
  { icon: ScanLine, title: "La lecture", text: "En cas de perte, n'importe quel lecteur ISO permet de lire la puce. Le numéro saisi sur Puce ID permet de prévenir le propriétaire." },
  { icon: ShieldCheck, title: "La protection des données", text: "Les coordonnées ne sont visibles que par les vétérinaires vérifiés. Chaque consultation est tracée dans un journal d'accès." },
  { icon: HeartPulse, title: "Le suivi", text: "Mettez à jour la fiche à chaque événement : déménagement, changement de numéro, cession ou décès de l'animal." },
];

export default function GuidePage() {
  return (
    <>
      <PageHero eyebrow="Ressources" title="Guide de l'identification" description="Pourquoi et comment identifier son animal par puce électronique." />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title} className="p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-subtle">{String(i + 1).padStart(2, "0")}</p>
              <p className="text-sm font-semibold text-ink">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/veterinaires">Trouver un vétérinaire</ButtonLink>
          <ButtonLink href="/faq" variant="secondary">Questions fréquentes</ButtonLink>
        </div>
      </div>
    </>
  );
}
