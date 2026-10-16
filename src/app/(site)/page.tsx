import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, MapPin, SearchX, ShieldCheck, Stethoscope } from "lucide-react";
import { findPublicChip } from "@/lib/data/queries";
import { fileHref, formatChip, isValidChip, normalizeChip } from "@/lib/utils";
import siteImages from "@/lib/site-images.json";
import { ANIMAL_STATUS, SEX_LABEL, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { Alert, Avatar, Badge, ButtonLink, Card, InfoItem } from "@/components/ui";
import { ChipSearch } from "@/components/chip-search";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <Badge tone="brand" className="mb-5">
              <T fr="Registre des animaux identifiés par puce" mg="Rejisitry ny biby voamarika amin'ny puce" />
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.6rem]">
              <T
                fr="Retrouvez le propriétaire d'un animal grâce à sa puce électronique"
                mg="Tadiavo ny tompon'ny biby iray amin'ny alalan'ny puce elektronika ao aminy"
              />
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              <T
                fr="Saisissez le numéro de puce à 15 chiffres pour vérifier le statut de l'animal et contacter son propriétaire en toute sécurité."
                mg="Ampidiro ny laharan'ny puce misy isa 15 mba hamantarana ny toetry ny biby sy hifandraisana amin'ny tompony amin'ny fomba azo antoka."
              />
            </p>
            <Suspense fallback={<ChipSearch className="mt-7 max-w-lg" />}>
              <SearchWithValue searchParams={searchParams} />
            </Suspense>
            <p className="mt-3 text-xs text-subtle">
              <T fr="Vous avez trouvé un animal sans puce ?" mg="Nahita biby tsy misy puce ve ianao ?" />{" "}
              <Link href="/perdu-trouve#declarer" className="font-medium text-brand-700 hover:underline">
                <T fr="Déclarez-le ici" mg="Ambarao eto" />
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
          src={fileHref(siteImages["hero-veterinaire-madagascar"])!}
          alt="Une vétérinaire malgache lit la puce électronique d’un chien dans une clinique"
          fill
          preload
          unoptimized
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 via-transparent to-transparent" />
      </div>
      <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-line sm:left-8">
        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ShieldCheck className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-ink">Puce ISO 11784</p>
          <p className="text-[11px] text-muted">
            <T fr="Lecture sécurisée · 15 chiffres" mg="Famakiana voaaro · isa 15" />
          </p>
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
          <T
            fr={`Le numéro saisi comporte ${chip.length} chiffre${chip.length > 1 ? "s" : ""}. Un numéro de puce électronique en comporte exactement 15.`}
            mg={`Misy isa ${chip.length} ny laharana nampidirinao. Isa 15 marina no ao amin'ny laharan'ny puce elektronika.`}
          />
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
          <p className="mt-4 text-sm font-semibold text-ink">
            <T fr="Aucun animal enregistré" mg="Tsy misy biby voasoratra" />
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            <T
              fr={`La puce ${formatChip(chip)} n'est pas encore dans le registre. Vous pouvez signaler l'animal trouvé ou contacter un vétérinaire partenaire.`}
              mg={`Mbola tsy ao amin'ny rejisitra ny puce ${formatChip(chip)}. Afaka manambara ilay biby hitanao ianao na mifandray amin'ny dokotera mpiara-miasa aminay.`}
            />
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <ButtonLink href={`/perdu-trouve?type=found&puce=${chip}#declarer`}>
              <T fr="Déclarer un animal trouvé" mg="Hanambara biby hita" />
            </ButtonLink>
            <ButtonLink href="/veterinaires" variant="secondary">
              <T fr="Trouver un vétérinaire" mg="Hitady dokotera mpitsabo biby" />
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
              <p className="text-base font-semibold text-ink">
                <T fr="Animal identifié" mg="Biby fantatra" />
              </p>
              <p className="font-mono text-xs text-muted">Puce {formatChip(animal.chipNumber)}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Badge tone="green">
              <T fr="Enregistré" mg="Voasoratra" />
            </Badge>
            <Badge tone={status.tone}>
              <T {...status.label} />
            </Badge>
          </div>
        </div>

        {animal.status === "lost" && (
          <Alert tone="red" className="mt-5">
            <T fr="Cet animal est déclaré" mg="Nambaran'ny tompony fa" />{" "}
            <strong>
              <T fr="disparu" mg="very" />
            </strong>{" "}
            <T
              fr="par son propriétaire. Merci de le contacter sans attendre."
              mg="ity biby ity. Mifandraisa aminy avy hatrany azafady."
            />
          </Alert>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoItem label={<T fr="Espèce" mg="Karazana" />} value={<T {...speciesLabel(animal.species)} />} />
          <InfoItem label={<T fr="Race" mg="Fokom-biby" />} value={animal.breed} />
          <InfoItem label={<T fr="Sexe" mg="Lahy sa vavy" />} value={<T {...SEX_LABEL[animal.sex]} />} />
          <InfoItem label={<T fr="Statut" mg="Toetra" />} value={<T {...status.label} />} />
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href={`/puce/${animal.chipNumber}/contact`} className="flex-1">
            <HeartHandshake className="size-4" /> <T fr="Contacter anonymement" mg="Hifandray tsy mampiseho anarana" />
          </ButtonLink>
          <ButtonLink href={`/puce/${animal.chipNumber}/contester`} variant="secondary" className="flex-1">
            <T fr="Contester cet enregistrement" mg="Hanohitra ity fisoratana ity" />
          </ButtonLink>
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          <T
            fr="Les coordonnées du propriétaire ne sont jamais affichées publiquement. Votre message lui est transmis par Puce ID."
            mg="Tsy aseho ampahibemaso mihitsy ny fifandraisana amin'ny tompony. Ny Puce ID no mampita ny hafatrao aminy."
          />
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
      title: { fr: "Le vétérinaire pose la puce", mg: "Mametraka ny puce ny dokotera" },
      text: {
        fr: "Un vétérinaire vérifié implante la puce et enregistre l'animal et son propriétaire.",
        mg: "Dokotera mpitsabo biby voamarina no mametraka ny puce sy manoratra ny biby sy ny tompony.",
      },
    },
    {
      icon: ShieldCheck,
      title: { fr: "Les données sont protégées", mg: "Voaaro ny angona" },
      text: {
        fr: "Seuls les vétérinaires vérifiés accèdent aux coordonnées, chaque consultation est journalisée.",
        mg: "Ny dokotera voamarina ihany no mahita ny fifandraisana, ary voasoratra ao amin'ny diary ny fijerena tsirairay.",
      },
    },
    {
      icon: MapPin,
      title: { fr: "L'animal retrouve son foyer", mg: "Mody any an-tranony ny biby" },
      text: {
        fr: "Quiconque trouve l'animal peut vérifier la puce et prévenir son propriétaire anonymement.",
        mg: "Izay mahita ilay biby dia afaka manamarina ny puce ary mampahafantatra ny tompony tsy mampiseho anarana.",
      },
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">
        <T fr="Comment fonctionne le registre ?" mg="Ahoana no fiasan'ny rejisitra ?" />
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.title.fr} className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon className="size-5" />
              </span>
              <span className="text-xs font-semibold text-subtle">
                <T fr="Étape" mg="Dingana" /> {i + 1}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">
              <T {...s.title} />
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              <T {...s.text} />
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/inscription">
          <T fr="Créer un compte propriétaire" mg="Hamorona kaonty tompon'biby" />
        </ButtonLink>
        <ButtonLink href="/inscription?role=vet" variant="secondary">
          <T fr="Je suis vétérinaire" mg="Dokotera mpitsabo biby aho" />
        </ButtonLink>
      </div>
    </section>
  );
}
