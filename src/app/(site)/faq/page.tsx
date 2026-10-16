import { ChevronDown } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { T, type Bi } from "@/components/layout/lang-toggle";

export const metadata = { title: "Questions fréquentes" };

const FAQ: { section: Bi; items: [Bi, Bi][] }[] = [
  {
    section: { fr: "Propriétaires", mg: "Tompon'biby" },
    items: [
      [
        { fr: "Comment faire pucer mon animal ?", mg: "Ahoana no hametrahana puce amin'ny bibiko ?" },
        {
          fr: "Prenez rendez-vous chez un vétérinaire partenaire. Il pose la puce (geste rapide, comparable à une injection) et enregistre immédiatement votre animal dans le registre.",
          mg: "Makà fotoana amin'ny dokotera mpiara-miasa aminay. Izy no mametraka ny puce (haingana, toy ny tsindrona) ary manoratra avy hatrany ny bibinao ao amin'ny rejisitra.",
        },
      ],
      [
        {
          fr: "Mon animal est déjà pucé mais absent du registre, que faire ?",
          mg: "Efa misy puce ny bibiko nefa tsy ao amin'ny rejisitra, inona no tokony hatao ?",
        },
        {
          fr: "Demandez à votre vétérinaire de lire la puce et de l'enregistrer depuis son espace. Vous pouvez aussi créer un compte et enregistrer l'animal vous-même : la fiche sera marquée « à confirmer » jusqu'à validation par un vétérinaire.",
          mg: "Angataho amin'ny dokoteranao ny hamaky ny puce sy hanoratra azy ao amin'ny kaontiny. Afaka mamorona kaonty koa ianao ary manoratra ny biby irery : hasiana marika « mbola hamarinina » ny fiche mandra-pankatoavin'ny dokotera azy.",
        },
      ],
      [
        { fr: "Mon animal a disparu, que dois-je faire ?", mg: "Very ny bibiko, inona no tokony hataoko ?" },
        {
          fr: "Depuis votre espace, ouvrez la fiche de l'animal et cliquez sur « Déclarer disparu ». Toute personne qui scanne sa puce verra l'alerte et pourra vous contacter anonymement.",
          mg: "Ao amin'ny kaontinao, sokafy ny fiche-n'ny biby ary tsindrio ny « Ambarao fa very ». Hahita ny fampitandremana izay rehetra mi-scan ny puce-ny ary afaka mifandray aminao tsy mampiseho anarana.",
        },
      ],
      [
        {
          fr: "Je donne ou vends mon animal, comment changer de propriétaire ?",
          mg: "Hanome na hivarotra ny bibiko aho, ahoana no hanovana ny tompony ?",
        },
        {
          fr: "Depuis la fiche, lancez un transfert vers le nouveau propriétaire. Il reçoit une invitation et doit l'accepter : l'historique de propriété est conservé.",
          mg: "Ao amin'ny fiche, atombohy ny famindrana ho any amin'ny tompony vaovao. Mahazo fanasana izy ary tsy maintsy manaiky izany : voatahiry ny tantaran'ny fananana.",
        },
      ],
    ],
  },
  {
    section: { fr: "Animal trouvé", mg: "Biby hita" },
    items: [
      [
        { fr: "J'ai trouvé un animal, comment savoir s'il est pucé ?", mg: "Nahita biby aho, ahoana no hahafantarako raha misy puce izy ?" },
        {
          fr: "Tout vétérinaire partenaire peut lire la puce gratuitement. Saisissez ensuite le numéro à 15 chiffres sur la page d'accueil.",
          mg: "Afaka mamaky maimaim-poana ny puce ny dokotera mpiara-miasa rehetra. Avy eo, ampidiro ao amin'ny pejy fandraisana ny laharana misy isa 15.",
        },
      ],
      [
        { fr: "Vais-je voir les coordonnées du propriétaire ?", mg: "Ho hitako ve ny fifandraisana amin'ny tompony ?" },
        {
          fr: "Non. Pour protéger la vie privée, vous lui écrivez via un formulaire anonyme ; il reçoit vos coordonnées pour vous rappeler.",
          mg: "Tsia. Mba hiarovana ny fiainana manokana, manoratra aminy amin'ny alalan'ny taratasy tsy misy anarana ianao ; ny fifandraisana aminao no raisiny mba hiantsoany anao.",
        },
      ],
    ],
  },
  {
    section: { fr: "Vétérinaires", mg: "Dokotera mpitsabo biby" },
    items: [
      [
        { fr: "Comment obtenir un compte vétérinaire ?", mg: "Ahoana no hahazoana kaonty dokotera ?" },
        {
          fr: "Inscrivez-vous en choisissant « Vétérinaire » et renseignez votre numéro d'ordre. Notre équipe le vérifie auprès de l'Ordre avant d'activer l'accès aux coordonnées.",
          mg: "Misoratra anarana ary misafidiana « Dokotera mpitsabo biby », dia ampidiro ny laharanao ao amin'ny Holafitra (Ordre). Hamarinin'ny ekipanay any amin'ny Holafitra izany alohan'ny hanokafana ny fidirana amin'ny fifandraisana.",
        },
      ],
      [
        { fr: "Puis-je importer mes patients existants ?", mg: "Afaka manafatra ireo marariko efa misy ve aho ?" },
        {
          fr: "Oui, via « Importer un CSV » dans votre espace. Un modèle de fichier est fourni.",
          mg: "Eny, amin'ny alalan'ny « Hanafatra CSV » ao amin'ny kaontinao. Misy modely rakitra omena.",
        },
      ],
      [
        { fr: "Pourquoi mes consultations sont-elles journalisées ?", mg: "Nahoana no voasoratra ao amin'ny diary ny fijereko ?" },
        {
          fr: "Chaque accès aux coordonnées d'un propriétaire est enregistré dans le journal d'accès, consultable par vous et par l'administration, conformément à la politique de confidentialité.",
          mg: "Voasoratra ao amin'ny diarin'ny fidirana ny fijerena tsirairay ny fifandraisana amin'ny tompon'biby, azonao sy ny mpitantana jerena, araka ny politika momba ny tsiambaratelo.",
        },
      ],
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow={<T fr="Ressources" mg="Loharano" />}
        title={<T fr="Questions fréquentes" mg="Fanontaniana matetika" />}
        description={
          <T
            fr="Tout ce qu'il faut savoir sur l'identification et le registre Puce ID."
            mg="Izay rehetra tokony ho fantatra momba ny famantarana sy ny rejisitra Puce ID."
          />
        }
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        {FAQ.map((block) => (
          <section key={block.section.fr}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-700">
              <T {...block.section} />
            </h2>
            <Card className="divide-y divide-line">
              {block.items.map(([q, a]) => (
                <details key={q.fr} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                    <T {...q} />
                    <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    <T {...a} />
                  </p>
                </details>
              ))}
            </Card>
          </section>
        ))}
        <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <p className="text-sm text-ink">
            <T fr="Vous ne trouvez pas votre réponse ?" mg="Tsy hitanao ve ny valiny ?" />
          </p>
          <ButtonLink href="/contact">
            <T fr="Nous contacter" mg="Mifandraisa aminay" />
          </ButtonLink>
        </Card>
      </div>
    </>
  );
}
