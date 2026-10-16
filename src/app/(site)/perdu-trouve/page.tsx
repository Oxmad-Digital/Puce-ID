import { Suspense } from "react";
import Link from "next/link";
import { Calendar, MapPin, PawPrint, Phone } from "lucide-react";
import { listPublicLostFound } from "@/lib/data/queries";
import { REPORT_TYPE, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { cn, fileHref } from "@/lib/utils";
import { FmtDate } from "@/components/dates";
import { Badge, ButtonLink, Card, EmptyState, Skeleton } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { LostFoundForm } from "@/components/forms/lost-found-form";

export const metadata = { title: "Animaux perdus et trouvés" };

export default function LostFoundPage({ searchParams }: PageProps<"/perdu-trouve">) {
  return (
    <>
      <PageHero
        eyebrow={<T fr="Registre" mg="Rejisitra" />}
        title={<T fr="Animaux perdus et trouvés" mg="Biby very sy hita" />}
        description={
          <T
            fr="Consultez les annonces en cours ou signalez un animal. Si l'animal est pucé, son propriétaire est prévenu automatiquement."
            mg="Jereo ireo filazana misy ankehitriny na ambarao ny biby iray. Raha misy puce ilay biby, dia ampahafantarina ho azy ny tompony."
          />
        }
      >
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="#declarer" variant="white">
            <T fr="Déclarer un animal" mg="Hanambara biby" />
          </ButtonLink>
          <ButtonLink href="/" variant="primary" className="bg-white/10 hover:bg-white/20">
            <T fr="Vérifier une puce" mg="Hanamarina puce" />
          </ButtonLink>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Listing searchParams={searchParams} />
        </Suspense>

        <section id="declarer" className="mt-14 scroll-mt-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="text-xl font-bold text-ink">
                <T fr="Signaler un animal" mg="Hanambara biby" />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <T
                  fr="Un animal errant porte peut-être une puce : tout vétérinaire peut la lire gratuitement. Indiquez le numéro s'il est connu, nous prévenons alors directement le propriétaire."
                  mg="Mety misy puce ny biby mirenireny : afaka mamaky izany maimaim-poana ny dokotera mpitsabo biby rehetra. Ampidiro ny laharana raha fantatra, ary hampahafantatra mivantana ny tompony izahay."
                />
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                <li>
                  • <T fr="Mettez l'animal en sécurité, à l'ombre et avec de l'eau." mg="Apetraho amin'ny toerana azo antoka ny biby, eo amin'ny alokaloka ary omeo rano." />
                </li>
                <li>
                  • <T fr="Ne le nourrissez pas excessivement s'il est affaibli." mg="Aza omena sakafo be loatra raha malemy izy." />
                </li>
                <li>
                  • <T fr="Contactez un" mg="Mifandraisa amin'ny" />{" "}
                  <Link href="/veterinaires" className="font-medium text-brand-700 hover:underline">
                    <T fr="vétérinaire partenaire" mg="dokotera mpiara-miasa" />
                  </Link>{" "}
                  <T fr="pour lire la puce." mg="hamaky ny puce." />
                </li>
              </ul>
            </div>
            <Card className="p-6">
              <Suspense fallback={<Skeleton className="h-96" />}>
                <FormWithDefaults searchParams={searchParams} />
              </Suspense>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

async function FormWithDefaults({ searchParams }: Pick<PageProps<"/perdu-trouve">, "searchParams">) {
  const sp = await searchParams;
  return (
    <LostFoundForm
      defaultType={sp.type === "lost" ? "lost" : "found"}
      defaultChip={typeof sp.puce === "string" ? sp.puce : undefined}
    />
  );
}

async function Listing({ searchParams }: Pick<PageProps<"/perdu-trouve">, "searchParams">) {
  const sp = await searchParams;
  const filter = sp.filtre === "lost" || sp.filtre === "found" ? sp.filtre : undefined;
  const reports = await listPublicLostFound(filter);
  const tabs = [
    { label: { fr: "Toutes les annonces", mg: "Filazana rehetra" }, value: undefined },
    { label: { fr: "Perdus", mg: "Very" }, value: "lost" },
    { label: { fr: "Trouvés", mg: "Hita" }, value: "found" },
  ] as const;

  return (
    <>
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label.fr}
            href={t.value ? `/perdu-trouve?filtre=${t.value}` : "/perdu-trouve"}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold",
              filter === t.value ? "bg-brand-600 text-white" : "bg-white text-muted ring-1 ring-line hover:text-brand-700",
            )}
          >
            <T {...t.label} />
          </Link>
        ))}
      </div>
      {reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PawPrint className="size-5" />}
            title={<T fr="Aucune annonce en cours" mg="Tsy misy filazana amin'izao" />}
            description={
              <T
                fr="Bonne nouvelle : aucun animal n'est signalé pour le moment."
                mg="Vaovao tsara : tsy misy biby voalaza amin'izao fotoana izao."
              />
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => {
            const t = REPORT_TYPE[r.type];
            const photo = fileHref(r.photoKey ?? r.animal?.photoKey);
            return (
              <Card key={r.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] bg-brand-50">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-brand-200">
                      <PawPrint className="size-14" />
                    </div>
                  )}
                  <Badge tone={t.tone} className="absolute left-3 top-3">
                    <T {...t.label} />
                  </Badge>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-ink">
                    {r.animal?.name ?? (r.species ? <T {...speciesLabel(r.species)} /> : <T fr="Animal" mg="Biby" />)}{" "}
                    {(r.animal?.species ?? r.species) && (
                      <span className="font-normal text-muted">
                        · <T {...speciesLabel((r.animal?.species ?? r.species)!)} />
                      </span>
                    )}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.description}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted">
                    <p className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {r.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar className="size-3.5" /> <FmtDate value={r.occurredAt ?? r.createdAt} /></p>
                  </div>
                  <div className="mt-4">
                    {r.chipNumber && r.animalId ? (
                      <ButtonLink href={`/puce/${r.chipNumber}/contact`} size="sm" className="w-full">
                        <T fr="Contacter le propriétaire" mg="Hifandray amin'ny tompony" />
                      </ButtonLink>
                    ) : (
                      r.reporterContact && (
                        <a
                          href={r.reporterContact.includes("@") ? `mailto:${r.reporterContact}` : `tel:${r.reporterContact.replace(/\s/g, "")}`}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                        >
                          <Phone className="size-3.5" /> {r.reporterContact}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
