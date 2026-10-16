import { Cpu, FileCheck2, HeartPulse, ScanLine, ShieldCheck, Syringe } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Guide de l'identification" };

const steps = [
  {
    icon: Syringe,
    title: { fr: "La pose", mg: "Ny fametrahana" },
    text: {
      fr: "Le vétérinaire implante sous la peau, généralement côté gauche du cou, une puce de la taille d'un grain de riz. Le geste est rapide et ne nécessite pas d'anesthésie.",
      mg: "Ampidirin'ny dokotera ao ambanin'ny hoditra, matetika eo amin'ny ilany havian'ny tenda, ny puce iray mitovy habe amin'ny voam-bary. Haingana ny asa ary tsy mila fanatoranana.",
    },
  },
  {
    icon: Cpu,
    title: { fr: "Le numéro unique", mg: "Ny laharana tokana" },
    text: {
      fr: "Chaque puce porte un numéro ISO 11784/11785 de 15 chiffres. Les trois premiers identifient le pays ou le fabricant (450 pour Madagascar).",
      mg: "Samy manana laharana ISO 11784/11785 misy isa 15 ny puce tsirairay. Ny isa telo voalohany no manondro ny firenena na ny mpanamboatra (450 ho an'i Madagasikara).",
    },
  },
  {
    icon: FileCheck2,
    title: { fr: "L'enregistrement", mg: "Ny fisoratana" },
    text: {
      fr: "Le vétérinaire associe ce numéro à l'animal et à son propriétaire dans le registre Puce ID. Le propriétaire confirme ensuite ses coordonnées.",
      mg: "Ampifandraisin'ny dokotera amin'ny biby sy ny tompony ao amin'ny rejisitra Puce ID io laharana io. Avy eo ny tompony no manamafy ny fifandraisana aminy.",
    },
  },
  {
    icon: ScanLine,
    title: { fr: "La lecture", mg: "Ny famakiana" },
    text: {
      fr: "En cas de perte, n'importe quel lecteur ISO permet de lire la puce. Le numéro saisi sur Puce ID permet de prévenir le propriétaire.",
      mg: "Raha very ilay biby, dia azon'ny mpamaky ISO rehetra vakiana ny puce. Ny laharana ampidirina ao amin'ny Puce ID no ahafahana mampahafantatra ny tompony.",
    },
  },
  {
    icon: ShieldCheck,
    title: { fr: "La protection des données", mg: "Ny fiarovana ny angona" },
    text: {
      fr: "Les coordonnées ne sont visibles que par les vétérinaires vérifiés. Chaque consultation est tracée dans un journal d'accès.",
      mg: "Ny dokotera voamarina ihany no mahita ny fifandraisana. Voasoratra ao amin'ny diarin'ny fidirana ny fijerena tsirairay.",
    },
  },
  {
    icon: HeartPulse,
    title: { fr: "Le suivi", mg: "Ny fanaraha-maso" },
    text: {
      fr: "Mettez à jour la fiche à chaque événement : déménagement, changement de numéro, cession ou décès de l'animal.",
      mg: "Havaozy ny fiche isaky ny misy zava-mitranga : famindrana trano, fiovan'ny laharan-telefaonina, fanomezana na fivarotana, na fahafatesan'ny biby.",
    },
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHero
        eyebrow={<T fr="Ressources" mg="Loharano" />}
        title={<T fr="Guide de l'identification" mg="Torolalana momba ny famantarana" />}
        description={
          <T
            fr="Pourquoi et comment identifier son animal par puce électronique."
            mg="Nahoana sy ahoana no hamantarana ny biby amin'ny alalan'ny puce elektronika."
          />
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title.fr} className="p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-subtle">{String(i + 1).padStart(2, "0")}</p>
              <p className="text-sm font-semibold text-ink">
                <T {...s.title} />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <T {...s.text} />
              </p>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/veterinaires">
            <T fr="Trouver un vétérinaire" mg="Hitady dokotera mpitsabo biby" />
          </ButtonLink>
          <ButtonLink href="/faq" variant="secondary">
            <T fr="Questions fréquentes" mg="Fanontaniana matetika" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
