import { ArrowLeftRight, ExternalLink, HeartOff, Mail, MapPin, Phone, ScanLine, SearchX } from "lucide-react";
import { findAnimalIdByChip, getAnimal } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { SEX_LABEL } from "@/lib/labels";
import { formatChip, isValidChip, normalizeChip } from "@/lib/utils";
import { Alert, Avatar, ButtonLink, Card, InfoItem, PageHeader, StatusBadge } from "@/components/ui";
import { Modal } from "@/components/modal";
import { DeclareDeathForm, TransferForm } from "@/components/app/animal-actions";
import { VetFoundForm } from "@/components/app/vet-found-form";

export const metadata = { title: "Scanner une puce" };

const ACTION_LABEL: Record<string, string> = {
  transfert: "Initier un transfert",
  deces: "Déclarer un décès",
  trouve: "Déclarer un animal trouvé",
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
        title={ACTION_LABEL[action] ?? "Scanner une puce"}
        description={action ? "Commencez par identifier l'animal grâce à sa puce." : "Branchez votre lecteur USB ou saisissez le numéro : la recherche se lance à la validation."}
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
          <button className="h-14 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">Lire la puce</button>
        </form>
      </Card>

      {!verified && (
        <Alert tone="amber" className="mt-5">Votre compte doit être vérifié pour consulter les fiches.</Alert>
      )}

      {raw && verified && !isValidChip(chip) && (
        <Alert tone="amber" className="mt-5">Numéro invalide : {chip.length} chiffre(s) lu(s), 15 attendus.</Alert>
      )}

      {raw && verified && isValidChip(chip) && <Result chip={chip} action={action} user={user} />}

      {action === "trouve" && !raw && verified && (
        <Card className="mt-5 p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Ou déclarez directement</p>
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
        <p className="mt-3 text-sm font-semibold text-ink">Puce {formatChip(chip)} non enregistrée</p>
        <p className="mt-1 text-sm text-muted">Cet animal n&apos;est pas encore dans le registre.</p>
        <ButtonLink href={`/animaux/nouveau?puce=${chip}`} className="mt-5">Enregistrer cet animal</ButtonLink>
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
            <p className="text-xs text-muted">{[animal.species, animal.breed, SEX_LABEL[animal.sex]].filter(Boolean).join(" · ")}</p>
            <p className="mt-0.5 font-mono text-xs text-muted">{formatChip(animal.chipNumber)}</p>
          </div>
        </div>
        <StatusBadge status={animal.status} />
      </div>
      <div className="grid gap-4 border-t border-line bg-surface/50 p-5 sm:grid-cols-3">
        <InfoItem label="Propriétaire" value={animal.ownerName} />
        <InfoItem label="Téléphone" value={animal.ownerPhone && <a href={`tel:${animal.ownerPhone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-brand-700"><Phone className="size-3" /> {animal.ownerPhone}</a>} />
        <InfoItem label="Email" value={animal.ownerEmail && <a href={`mailto:${animal.ownerEmail}`} className="inline-flex items-center gap-1 text-brand-700"><Mail className="size-3" /> {animal.ownerEmail}</a>} />
      </div>
      <p className="border-t border-line px-5 py-2 text-[11px] text-muted">Consultation enregistrée dans votre journal d&apos;accès.</p>
      <div className="flex flex-wrap gap-2 border-t border-line p-5">
        <ButtonLink href={`/animaux/${animal.id}`} variant={action ? "secondary" : "primary"} size="sm"><ExternalLink className="size-3.5" /> Ouvrir la fiche</ButtonLink>
        {animal.status !== "deceased" && (
          <>
            <Modal trigger={<><ArrowLeftRight className="size-3.5" /> Transfert</>} title="Initier un transfert" size="sm" variant={action === "transfert" ? "primary" : "secondary"}>
              <TransferForm animalId={animal.id} />
            </Modal>
            <Modal trigger={<><MapPin className="size-3.5" /> Déclarer trouvé</>} title="Animal recueilli à la clinique" size="sm" variant={action === "trouve" ? "primary" : "secondary"}>
              <VetFoundForm defaultChip={animal.chipNumber} />
            </Modal>
            <Modal trigger={<><HeartOff className="size-3.5" /> Décès</>} title={`Déclarer le décès de ${animal.name}`} size="sm" variant={action === "deces" ? "primary" : "secondary"}>
              <DeclareDeathForm animalId={animal.id} />
            </Modal>
          </>
        )}
      </div>
    </Card>
  );
}
