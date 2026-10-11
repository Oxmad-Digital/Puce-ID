import { ChevronDown } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { PageHero } from "@/components/page-hero";

export const metadata = { title: "Questions fréquentes" };

const FAQ: { section: string; items: [string, string][] }[] = [
  {
    section: "Propriétaires",
    items: [
      ["Comment faire pucer mon animal ?", "Prenez rendez-vous chez un vétérinaire partenaire. Il pose la puce (geste rapide, comparable à une injection) et enregistre immédiatement votre animal dans le registre."],
      ["Mon animal est déjà pucé mais absent du registre, que faire ?", "Demandez à votre vétérinaire de lire la puce et de l'enregistrer depuis son espace. Vous pouvez aussi créer un compte et enregistrer l'animal vous-même : la fiche sera marquée « à confirmer » jusqu'à validation par un vétérinaire."],
      ["Mon animal a disparu, que dois-je faire ?", "Depuis votre espace, ouvrez la fiche de l'animal et cliquez sur « Déclarer disparu ». Toute personne qui scanne sa puce verra l'alerte et pourra vous contacter anonymement."],
      ["Je donne ou vends mon animal, comment changer de propriétaire ?", "Depuis la fiche, lancez un transfert vers le nouveau propriétaire. Il reçoit une invitation et doit l'accepter : l'historique de propriété est conservé."],
    ],
  },
  {
    section: "Animal trouvé",
    items: [
      ["J'ai trouvé un animal, comment savoir s'il est pucé ?", "Tout vétérinaire partenaire peut lire la puce gratuitement. Saisissez ensuite le numéro à 15 chiffres sur la page d'accueil."],
      ["Vais-je voir les coordonnées du propriétaire ?", "Non. Pour protéger la vie privée, vous lui écrivez via un formulaire anonyme ; il reçoit vos coordonnées pour vous rappeler."],
    ],
  },
  {
    section: "Vétérinaires",
    items: [
      ["Comment obtenir un compte vétérinaire ?", "Inscrivez-vous en choisissant « Vétérinaire » et renseignez votre numéro d'ordre. Notre équipe le vérifie auprès de l'Ordre avant d'activer l'accès aux coordonnées."],
      ["Puis-je importer mes patients existants ?", "Oui, via « Importer un CSV » dans votre espace. Un modèle de fichier est fourni."],
      ["Pourquoi mes consultations sont-elles journalisées ?", "Chaque accès aux coordonnées d'un propriétaire est enregistré dans le journal d'accès, consultable par vous et par l'administration, conformément à la politique de confidentialité."],
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="Ressources" title="Questions fréquentes" description="Tout ce qu'il faut savoir sur l'identification et le registre PawSafe." />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        {FAQ.map((block) => (
          <section key={block.section}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-700">{block.section}</h2>
            <Card className="divide-y divide-line">
              {block.items.map(([q, a]) => (
                <details key={q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                    {q}
                    <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
                </details>
              ))}
            </Card>
          </section>
        ))}
        <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <p className="text-sm text-ink">Vous ne trouvez pas votre réponse ?</p>
          <ButtonLink href="/contact">Nous contacter</ButtonLink>
        </Card>
      </div>
    </>
  );
}
