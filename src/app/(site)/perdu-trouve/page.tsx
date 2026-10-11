import { Suspense } from "react";
import Link from "next/link";
import { Calendar, MapPin, PawPrint, Phone } from "lucide-react";
import { listPublicLostFound } from "@/lib/data/queries";
import { REPORT_TYPE } from "@/lib/labels";
import { cn, fileHref, formatDate } from "@/lib/utils";
import { Badge, ButtonLink, Card, EmptyState, Skeleton } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { LostFoundForm } from "@/components/forms/lost-found-form";

export const metadata = { title: "Animaux perdus et trouvés" };

export default function LostFoundPage({ searchParams }: PageProps<"/perdu-trouve">) {
  return (
    <>
      <PageHero
        eyebrow="Registre"
        title="Animaux perdus et trouvés"
        description="Consultez les annonces en cours ou signalez un animal. Si l'animal est pucé, son propriétaire est prévenu automatiquement."
      >
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="#declarer" variant="white">Déclarer un animal</ButtonLink>
          <ButtonLink href="/" variant="primary" className="bg-white/10 hover:bg-white/20">Vérifier une puce</ButtonLink>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Listing searchParams={searchParams} />
        </Suspense>

        <section id="declarer" className="mt-14 scroll-mt-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="text-xl font-bold text-ink">Signaler un animal</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Un animal errant porte peut-être une puce : tout vétérinaire peut la lire
                gratuitement. Indiquez le numéro s&apos;il est connu, nous prévenons alors directement le
                propriétaire.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                <li>• Mettez l&apos;animal en sécurité, à l&apos;ombre et avec de l&apos;eau.</li>
                <li>• Ne le nourrissez pas excessivement s&apos;il est affaibli.</li>
                <li>• Contactez un <Link href="/veterinaires" className="font-medium text-brand-700 hover:underline">vétérinaire partenaire</Link> pour lire la puce.</li>
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
    { label: "Toutes les annonces", value: undefined },
    { label: "Perdus", value: "lost" },
    { label: "Trouvés", value: "found" },
  ] as const;

  return (
    <>
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/perdu-trouve?filtre=${t.value}` : "/perdu-trouve"}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold",
              filter === t.value ? "bg-brand-600 text-white" : "bg-white text-muted ring-1 ring-line hover:text-brand-700",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      {reports.length === 0 ? (
        <Card>
          <EmptyState icon={<PawPrint className="size-5" />} title="Aucune annonce en cours" description="Bonne nouvelle : aucun animal n'est signalé pour le moment." />
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
                  <Badge tone={t.tone} className="absolute left-3 top-3">{t.label}</Badge>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-ink">
                    {r.animal?.name ?? r.species ?? "Animal"}{" "}
                    <span className="font-normal text-muted">· {r.animal?.species ?? r.species}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.description}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted">
                    <p className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {r.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {formatDate(r.occurredAt ?? r.createdAt)}</p>
                  </div>
                  <div className="mt-4">
                    {r.chipNumber && r.animalId ? (
                      <ButtonLink href={`/puce/${r.chipNumber}/contact`} size="sm" className="w-full">
                        Contacter le propriétaire
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
