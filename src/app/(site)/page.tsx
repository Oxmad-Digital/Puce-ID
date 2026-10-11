import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, MapPin, SearchX, ShieldCheck, Stethoscope } from "lucide-react";
import { findPublicChip } from "@/lib/data/queries";
import { formatChip, isValidChip, normalizeChip } from "@/lib/utils";
import { ANIMAL_STATUS, SEX_LABEL } from "@/lib/labels";
import { Alert, Avatar, Badge, ButtonLink, Card, InfoItem } from "@/components/ui";
import { ChipSearch } from "@/components/chip-search";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <Badge tone="brand" className="mb-5">
              Registre des animaux identifiés par puce
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.6rem]">
              Retrouvez le propriétaire d&apos;un animal grâce à sa puce électronique
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              Saisissez le numéro de puce à 15 chiffres pour vérifier le statut de l&apos;animal et
              contacter son propriétaire en toute sécurité.
            </p>
            <Suspense fallback={<ChipSearch className="mt-7 max-w-lg" />}>
              <SearchWithValue searchParams={searchParams} />
            </Suspense>
            <p className="mt-3 text-xs text-subtle">
              Vous avez trouvé un animal sans puce ?{" "}
              <Link href="/perdu-trouve#declarer" className="font-medium text-brand-700 hover:underline">
                Déclarez-le ici
              </Link>
            </p>
          </div>
          <HeroVisual />
        </div>
      </section>

      <Suspense fallback={null}>
        <SearchResult searchParams={searchParams} />
      </Suspense>

      <HowItWorks />
    </>
  );
}

async function SearchWithValue({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { puce } = await searchParams;
  return <ChipSearch className="mt-7 max-w-lg" defaultValue={typeof puce === "string" ? puce : ""} />;
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-brand-100">
        <Image
          src="/images/hero.jpg"
          alt="Un chien et un chat allongés dans l'herbe"
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 via-transparent to-transparent" />
      </div>
      {/* Halo « scan » de la puce */}
      <div className="absolute left-[38%] top-[48%] size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 shadow-[0_0_0_10px_rgba(255,255,255,0.18)] sm:size-36" />
      <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-line sm:left-8">
        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ShieldCheck className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-ink">Puce ISO 11784</p>
          <p className="text-[11px] text-muted">Lecture sécurisée · 15 chiffres</p>
        </div>
      </div>
    </div>
  );
}

async function SearchResult({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { puce } = await searchParams;
  if (typeof puce !== "string" || !puce.trim()) return null;

  const chip = normalizeChip(puce);
  if (!isValidChip(chip)) {
    return (
      <ResultWrapper>
        <Alert tone="amber">
          Le numéro saisi comporte {chip.length} chiffre{chip.length > 1 ? "s" : ""}. Un numéro de
          puce électronique en comporte exactement 15.
        </Alert>
      </ResultWrapper>
    );
  }

  const animal = await findPublicChip(chip);

  if (!animal) {
    return (
      <ResultWrapper>
        <Card className="p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <SearchX className="size-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink">Aucun animal enregistré</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            La puce {formatChip(chip)} n&apos;est pas encore dans le registre. Vous pouvez signaler
            l&apos;animal trouvé ou contacter un vétérinaire partenaire.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <ButtonLink href={`/perdu-trouve?type=found&puce=${chip}#declarer`}>Déclarer un animal trouvé</ButtonLink>
            <ButtonLink href="/veterinaires" variant="secondary">
              Trouver un vétérinaire
            </ButtonLink>
          </div>
        </Card>
      </ResultWrapper>
    );
  }

  const status = ANIMAL_STATUS[animal.status];
  return (
    <ResultWrapper>
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={animal.name} size="lg" />
            <div>
              <p className="text-base font-semibold text-ink">Animal identifié</p>
              <p className="font-mono text-xs text-muted">Puce {formatChip(animal.chipNumber)}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Badge tone="green">Enregistré</Badge>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
        </div>

        {animal.status === "lost" && (
          <Alert tone="red" className="mt-5">
            Cet animal est déclaré <strong>disparu</strong> par son propriétaire. Merci de le
            contacter sans attendre.
          </Alert>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoItem label="Espèce" value={animal.species} />
          <InfoItem label="Race" value={animal.breed} />
          <InfoItem label="Sexe" value={SEX_LABEL[animal.sex]} />
          <InfoItem label="Statut" value={status.label} />
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href={`/puce/${animal.chipNumber}/contact`} className="flex-1">
            <HeartHandshake className="size-4" /> Contacter anonymement
          </ButtonLink>
          <ButtonLink href={`/puce/${animal.chipNumber}/contester`} variant="secondary" className="flex-1">
            Contester cet enregistrement
          </ButtonLink>
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          Les coordonnées du propriétaire ne sont jamais affichées publiquement. Votre message lui
          est transmis par PawSafe.
        </p>
      </Card>
    </ResultWrapper>
  );
}

function ResultWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section id="resultat" className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {children}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Stethoscope,
      title: "Le vétérinaire pose la puce",
      text: "Un vétérinaire vérifié implante la puce et enregistre l'animal et son propriétaire.",
    },
    {
      icon: ShieldCheck,
      title: "Les données sont protégées",
      text: "Seuls les vétérinaires vérifiés accèdent aux coordonnées, chaque consultation est journalisée.",
    },
    {
      icon: MapPin,
      title: "L'animal retrouve son foyer",
      text: "Quiconque trouve l'animal peut vérifier la puce et prévenir son propriétaire anonymement.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">Comment fonctionne le registre ?</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.title} className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon className="size-5" />
              </span>
              <span className="text-xs font-semibold text-subtle">Étape {i + 1}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">{s.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/inscription">Créer un compte propriétaire</ButtonLink>
        <ButtonLink href="/inscription?role=vet" variant="secondary">
          Je suis vétérinaire
        </ButtonLink>
      </div>
    </section>
  );
}
