import { ArrowLeftRight, ExternalLink, HeartOff, Mail, MapPin, Phone, ScanLine, SearchX } from "lucide-react";
import { findAnimalIdByChip, getAnimal } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { SEX_LABEL, speciesLabel } from "@/lib/labels";
import { T, type Bi } from "@/components/layout/lang-toggle";
import { formatChip, isValidChip, normalizeChip } from "@/lib/utils";
import { Alert, Avatar, ButtonLink, Card, InfoItem, PageHeader, StatusBadge } from "@/components/ui";
import { Modal } from "@/components/modal";
import { DeclareDeathForm, TransferForm } from "@/components/app/animal-actions";
import { VetFoundForm } from "@/components/app/vet-found-form";

export const metadata = { title: "Scanner une puce" };

const ACTION_LABEL: Record<string, Bi> = {
  transfert: { fr: "Initier un transfert", mg: "Hanomboka famindrana" },
  deces: { fr: "Déclarer un décès", mg: "Hanambara fahafatesana" },
  trouve: { fr: "Déclarer un animal trouvé", mg: "Hanambara biby hita" },
};

export default async function ScannerPage({ searchParams }: PageProps<"/veterinaire/scanner">) {
  const user = await requireRole("vet", "admin");
  const sp = await searchParams;
  const raw = typeof sp.puce === "string" ? sp.puce : "";
  const action = typeof sp.action === "string" ? sp.action : "";
  const chip = normalizeChip(raw);
  const verified = user.role === "admin" || user.vet?.status === "verified";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={<T {...(ACTION_LABEL[action] ?? { fr: "Scanner une puce", mg: "Hi-scan puce" })} />}
        description={
          action ? (
            <T
              fr="Commencez par identifier l'animal grâce à sa puce."
              mg="Atombohy amin'ny famantarana ny biby amin'ny alalan'ny puce-ny."
            />
          ) : (
            <T
              fr="Branchez votre lecteur USB ou saisissez le numéro : la recherche se lance à la validation."
              mg="Ampifandraiso ny mpamaky USB na soraty ny laharana : manomboka ny fikarohana rehefa voamafy."
            />
          )
        }
      />

      <Card className="p-5">
        <form className="flex flex-col gap-3 sm:flex-row">
          {action && <input type="hidden" name="action" value={action} />}
          <div className="relative flex-1">
            <ScanLine className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-brand-500" />
            <input
              name="puce"
              defaultValue={raw}
              autoFocus
              inputMode="numeric"
              autoComplete="off"
              placeholder="450 200 000 123 456"
              className="field-input h-14 pl-11 font-mono text-lg tracking-wider"
            />
          </div>
          <button className="h-14 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">
            <T fr="Lire la puce" mg="Vakio ny puce" />
          </button>
        </form>
      </Card>

      {!verified && (
        <Alert tone="amber" className="mt-5">
          <T
            fr="Votre compte doit être vérifié pour consulter les fiches."
            mg="Tsy maintsy voamarina ny kaontinao vao afaka mijery ny fiche."
          />
        </Alert>
      )}

      {raw && verified && !isValidChip(chip) && (
        <Alert tone="amber" className="mt-5">
          <T
            fr={`Numéro invalide : ${chip.length} chiffre(s) lu(s), 15 attendus.`}
            mg={`Laharana tsy mety : isa ${chip.length} no voavaky, isa 15 no ilaina.`}
          />
        </Alert>
      )}

      {raw && verified && isValidChip(chip) && <Result chip={chip} action={action} user={user} />}

      {action === "trouve" && !raw && verified && (
        <Card className="mt-5 p-5">
          <p className="mb-4 text-sm font-semibold text-ink">
            <T fr="Ou déclarez directement" mg="Na ambarao mivantana" />
          </p>
          <VetFoundForm />
        </Card>
      )}
    </div>
  );
}

async function Result({ chip, action, user }: { chip: string; action: string; user: Awaited<ReturnType<typeof requireRole>> }) {
  const id = await findAnimalIdByChip(chip);
  const animal = id ? await getAnimal(user, id) : null;

  if (!animal) {
    return (
      <Card className="mt-5 p-6 text-center">
        <SearchX className="mx-auto size-8 text-subtle" />
        <p className="mt-3 text-sm font-semibold text-ink">
          <T fr={`Puce ${formatChip(chip)} non enregistrée`} mg={`Tsy voasoratra ny puce ${formatChip(chip)}`} />
        </p>
        <p className="mt-1 text-sm text-muted">
          <T fr="Cet animal n'est pas encore dans le registre." mg="Mbola tsy ao amin'ny rejisitra ity biby ity." />
        </p>
        <ButtonLink href={`/animaux/nouveau?puce=${chip}`} className="mt-5">
          <T fr="Enregistrer cet animal" mg="Soraty ity biby ity" />
        </ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="mt-5 overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={animal.name} size="lg" src={animal.photoKey ? `/api/files/${animal.photoKey}` : null} />
          <div>
            <p className="text-base font-bold text-ink">{animal.name}</p>
            <p className="text-xs text-muted">
              <T {...speciesLabel(animal.species)} />
              {animal.breed && ` · ${animal.breed}`} · <T {...SEX_LABEL[animal.sex]} />
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted">{formatChip(animal.chipNumber)}</p>
          </div>
        </div>
        <StatusBadge status={animal.status} />
      </div>
      <div className="grid gap-4 border-t border-line bg-surface/50 p-5 sm:grid-cols-3">
        <InfoItem label={<T fr="Propriétaire" mg="Tompony" />} value={animal.ownerName} />
        <InfoItem label={<T fr="Téléphone" mg="Telefaonina" />} value={animal.ownerPhone && <a href={`tel:${animal.ownerPhone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-brand-700"><Phone className="size-3" /> {animal.ownerPhone}</a>} />
        <InfoItem label={<T fr="E-mail" mg="Mailaka" />} value={animal.ownerEmail && <a href={`mailto:${animal.ownerEmail}`} className="inline-flex items-center gap-1 text-brand-700"><Mail className="size-3" /> {animal.ownerEmail}</a>} />
      </div>
      <p className="border-t border-line px-5 py-2 text-[11px] text-muted">
        <T
          fr="Consultation enregistrée dans votre journal d'accès."
          mg="Voasoratra ao amin'ny diarin'ny fidiranao ity fijerena ity."
        />
      </p>
      <div className="flex flex-wrap gap-2 border-t border-line p-5">
        <ButtonLink href={`/animaux/${animal.id}`} variant={action ? "secondary" : "primary"} size="sm"><ExternalLink className="size-3.5" /> <T fr="Ouvrir la fiche" mg="Sokafy ny fiche" />
        </ButtonLink>
        {animal.status !== "deceased" && (
          <>
            <Modal
              trigger={
                <>
                  <ArrowLeftRight className="size-3.5" /> <T fr="Transfert" mg="Famindrana" />
                </>
              }
              title={<T fr="Initier un transfert" mg="Hanomboka famindrana" />} size="sm" variant={action === "transfert" ? "primary" : "secondary"}>
              <TransferForm animalId={animal.id} />
            </Modal>
            <Modal
              trigger={
                <>
                  <MapPin className="size-3.5" /> <T fr="Déclarer trouvé" mg="Ambarao fa hita" />
                </>
              }
              title={<T fr="Animal recueilli à la clinique" mg="Biby noraisina tao amin'ny toeram-pitsaboana" />} size="sm" variant={action === "trouve" ? "primary" : "secondary"}>
              <VetFoundForm defaultChip={animal.chipNumber} />
            </Modal>
            <Modal
              trigger={
                <>
                  <HeartOff className="size-3.5" /> <T fr="Décès" mg="Fahafatesana" />
                </>
              }
              title={<T fr={`Déclarer le décès de ${animal.name}`} mg={`Ambarao ny fahafatesan'i ${animal.name}`} />} size="sm" variant={action === "deces" ? "primary" : "secondary"}>
              <DeclareDeathForm animalId={animal.id} />
            </Modal>
          </>
        )}
      </div>
    </Card>
  );
}
