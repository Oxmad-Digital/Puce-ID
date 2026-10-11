import { Suspense } from "react";
import { BadgeCheck, Mail, MapPin, Phone, Stethoscope } from "lucide-react";
import { listVerifiedVets, listVetCities } from "@/lib/data/queries";
import { Avatar, ButtonLink, Card, EmptyState, Input, Select, Skeleton } from "@/components/ui";
import { PageHero } from "@/components/page-hero";

export const metadata = { title: "Vétérinaires partenaires" };

export default function VetsPage({ searchParams }: PageProps<"/veterinaires">) {
  return (
    <>
      <PageHero
        eyebrow="Ressources"
        title="Vétérinaires partenaires"
        description="Ces cliniques ont vu leur numéro d'ordre vérifié par PawSafe. Elles peuvent poser une puce, lire une puce et enregistrer votre animal dans le registre."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <VetDirectory searchParams={searchParams} />
        </Suspense>
        <Card className="mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
              <Stethoscope className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Vous êtes vétérinaire ?</p>
              <p className="text-xs text-muted">Rejoignez le registre pour enregistrer vos patients et lire les puces.</p>
            </div>
          </div>
          <ButtonLink href="/inscription?role=vet">Créer un compte vétérinaire</ButtonLink>
        </Card>
      </div>
    </>
  );
}

async function VetDirectory({ searchParams }: Pick<PageProps<"/veterinaires">, "searchParams">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const city = typeof sp.ville === "string" ? sp.ville : "";
  const [vets, cities] = await Promise.all([
    listVerifiedVets({ q: q || undefined, city: city || undefined }),
    listVetCities(),
  ]);

  return (
    <>
      <form className="mb-6 flex flex-col gap-2 sm:flex-row">
        <Input name="q" defaultValue={q} placeholder="Nom de la clinique ou du vétérinaire" className="sm:max-w-sm" />
        <Select name="ville" defaultValue={city} className="sm:max-w-[200px]">
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <button className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          Filtrer
        </button>
      </form>

      {vets.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Stethoscope className="size-5" />}
            title="Aucun vétérinaire trouvé"
            description="Essayez une autre ville ou retirez les filtres."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vets.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar name={v.clinicName} tone="accent" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-semibold text-ink">
                    {v.clinicName} <BadgeCheck className="size-4 text-brand-600" />
                  </p>
                  <p className="text-xs text-muted">Dr {v.name}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-muted">
                <li className="flex items-center gap-2">
                  <MapPin className="size-3.5" /> {[v.address, v.city].filter(Boolean).join(", ")}
                </li>
                {v.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="size-3.5" />
                    <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">{v.phone}</a>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Mail className="size-3.5" />
                  <a href={`mailto:${v.email}`} className="truncate hover:text-brand-700">{v.email}</a>
                </li>
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
