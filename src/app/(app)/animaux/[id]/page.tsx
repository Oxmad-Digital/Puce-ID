import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertTriangle, ArrowLeftRight, Building2, Cpu, FileText, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { markFound, removeDocument } from "@/lib/actions/animals";
import { getAnimal, listActiveClinics } from "@/lib/data/queries";
import { homeFor, requireUser } from "@/lib/session";
import { OWNERSHIP_EVENT, SEX_LABEL } from "@/lib/labels";
import { fileHref, formatAge, formatChip, formatDate } from "@/lib/utils";
import { Alert, Avatar, Badge, Button, ButtonLink, Card, CardHeader, InfoItem, PageHeader, StatusBadge } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ClinicTransferForm, DeclareDeathForm, DeclareLostForm, TransferForm } from "@/components/app/animal-actions";
import { DocumentsUploader } from "@/components/app/documents-uploader";

export const metadata = { title: "Fiche animal" };

export default async function AnimalPage({ params }: PageProps<"/animaux/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const animal = await getAnimal(user, id);
  if (!animal) notFound();
  await connection();
  const now = new Date();

  const age = formatAge(animal.birthDate, now);
  const isOwner = animal.ownerId === user.id;
  const isVet = user.role === "vet";
  const vetName = animal.implantedBy ? `Dr ${animal.implantedBy.name}` : animal.implantedByName;
  const pendingTransfer = animal.transfers[0];
  const pendingClinicTransfer = animal.clinicTransfers[0];
  const canChangeClinic =
    user.role === "admin" || isOwner || animal.isClinicVet || (animal.clinicId === null && animal.canEdit);
  const clinics = canChangeClinic && !pendingClinicTransfer ? await listActiveClinics() : [];
  const subtitle = [animal.species, animal.breed, SEX_LABEL[animal.sex], age].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        title=""
        breadcrumb={[
          { label: isVet ? "Mes patients" : "Mes animaux", href: isVet ? "/veterinaire/patients" : homeFor(user.role) === "/admin" ? "/admin" : "/mes-animaux" },
          { label: animal.name },
        ]}
      />

      <Card className="-mt-4 mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={animal.name} size="xl" src={fileHref(animal.photoKey)} />
          <div>
            <h1 className="text-xl font-bold text-ink">{animal.name}</h1>
            <p className="text-sm text-muted">{subtitle}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={animal.status} />
              {animal.ownerConfirmed ? <Badge tone="brand">Propriétaire confirmé</Badge> : <Badge tone="amber">Propriétaire à confirmer</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {animal.canEdit && (
            <ButtonLink href={`/animaux/${animal.id}/modifier`} variant="secondary" size="sm"><Pencil className="size-3.5" /> Modifier</ButtonLink>
          )}
          {isOwner && animal.status === "alive" && (
            <Modal trigger="Déclarer disparu" title={`Déclarer ${animal.name} disparu`} description="L'alerte s'affichera pour toute personne qui scanne sa puce." variant="dangerSoft" size="sm">
              <DeclareLostForm animalId={animal.id} />
            </Modal>
          )}
        </div>
      </Card>

      {(animal.status === "lost" || animal.status === "found") && (
        <Alert tone={animal.status === "lost" ? "red" : "brand"} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            {animal.status === "lost" ? `${animal.name} est déclaré disparu.` : `${animal.name} a été signalé trouvé.`}
          </span>
          {animal.canEdit && (
            <form action={markFound.bind(null, animal.id)}>
              <Button size="sm" variant="secondary">Il est de retour à la maison</Button>
            </form>
          )}
        </Alert>
      )}
      {pendingTransfer && (
        <Alert tone="amber" className="mb-6">
          Transfert en attente vers <strong>{pendingTransfer.toName}</strong> — expire le {formatDate(pendingTransfer.expiresAt)}.
        </Alert>
      )}
      {pendingClinicTransfer && (
        <Alert tone="amber" className="mb-6">
          Changement de clinique en attente vers <strong>{pendingClinicTransfer.toClinic.name}</strong> ({pendingClinicTransfer.toClinic.city}) — expire le {formatDate(pendingClinicTransfer.expiresAt)}.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Informations générales" />
            <dl className="grid grid-cols-2 gap-5 p-5 sm:grid-cols-4">
              <InfoItem label="Espèce" value={animal.species} />
              <InfoItem label="Race" value={animal.breed} />
              <InfoItem label="Sexe" value={SEX_LABEL[animal.sex]} />
              <InfoItem label="Couleur" value={animal.color} />
              <InfoItem label="Date de naissance" value={formatDate(animal.birthDate)} />
              <InfoItem label="Statut" value={<StatusBadge status={animal.status} />} />
              <InfoItem label="Enregistré le" value={formatDate(animal.createdAt)} />
              <InfoItem label="Vétérinaire poseur" value={vetName} />
              <InfoItem label="Clinique responsable" value={animal.clinic ? `${animal.clinic.name}, ${animal.clinic.city}` : "Aucune"} />
              {animal.deceasedAt && <InfoItem label="Date du décès" value={formatDate(animal.deceasedAt)} />}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Historique de propriété" />
            <ol className="space-y-5 p-5">
              {animal.history.map((h, i) => (
                <li key={h.id} className="relative flex gap-3">
                  <span className={`mt-1 size-2.5 shrink-0 rounded-full ${i === 0 ? "bg-brand-600 ring-4 ring-brand-100" : "bg-brand-200"}`} />
                  {i < animal.history.length - 1 && <span className="absolute left-[4.5px] top-4 h-[calc(100%+0.5rem)] w-px bg-line" />}
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {OWNERSHIP_EVENT[h.event]} · {h.ownerName}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(h.occurredAt)}
                      {h.note && ` · ${h.note}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader title="Documents" description="Certificats, carnet de vaccination… (PDF ou image)" action={animal.canEdit && <DocumentsUploader animalId={animal.id} />} />
            {animal.documents.length ? (
              <ul className="divide-y divide-line">
                {animal.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                    <FileText className="size-4 text-brand-600" />
                    <a href={`/api/files/${d.key}`} target="_blank" className="min-w-0 flex-1 truncate text-sm text-ink hover:text-brand-700">{d.fileName}</a>
                    <span className="text-[11px] text-muted">{Math.ceil(d.size / 1024)} Ko · {formatDate(d.createdAt)}</span>
                    {animal.canEdit && (
                      <form action={removeDocument.bind(null, d.id)}>
                        <button aria-label="Supprimer" className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-center text-xs text-muted">Aucun document.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <div className="rounded-[var(--radius-card)] bg-brand-800 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/70">Puce électronique</p>
              <Cpu className="size-4 text-white/60" />
            </div>
            <p className="mt-3 font-mono text-xl font-bold tracking-wider">{formatChip(animal.chipNumber)}</p>
            <p className="mt-2 text-xs text-white/70">
              Posée le {formatDate(animal.chipImplantedAt)}
              {animal.chipLocation && ` · ${animal.chipLocation}`}
            </p>
            {vetName && <p className="text-xs text-white/70">Vétérinaire : {vetName}{animal.implantedBy?.vetProfile ? ` — ${animal.implantedBy.vetProfile.clinic.name}` : ""}</p>}
            <Badge tone="amber" className="mt-3 bg-accent-500 text-white ring-0">ISO 11784</Badge>
          </div>

          <Card>
            <CardHeader title="Propriétaire" />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={animal.ownerName} />
                <div>
                  <p className="text-sm font-semibold text-ink">{animal.ownerName}</p>
                  <p className="text-xs text-muted">{animal.ownerCity ?? "—"}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-3">
                <InfoItem label="Téléphone" value={animal.ownerPhone} />
                <InfoItem label="Email" value={animal.ownerEmail} />
              </dl>
              {!isOwner && (animal.ownerPhone || animal.ownerEmail) && (
                <ButtonLink
                  href={animal.ownerPhone ? `tel:${animal.ownerPhone.replace(/\s/g, "")}` : `mailto:${animal.ownerEmail}`}
                  className="mt-4 w-full"
                >
                  {animal.ownerPhone ? <Phone className="size-4" /> : <Mail className="size-4" />} Contacter le propriétaire
                </ButtonLink>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                Visible uniquement par le propriétaire et les vétérinaires vérifiés. Chaque consultation est enregistrée dans le journal d&apos;accès.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Clinique responsable" />
            <div className="p-5">
              {animal.clinic ? (
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-accent-500/10 text-accent-600"><Building2 className="size-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{animal.clinic.name}</p>
                    <p className="text-xs text-muted">{animal.clinic.city}{animal.clinic.phone && ` · ${animal.clinic.phone}`}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Aucune clinique ne suit actuellement cet animal.</p>
              )}
              {canChangeClinic && !pendingClinicTransfer && animal.status !== "deceased" && (
                <Modal
                  trigger={<><Building2 className="size-4" /> {animal.clinic ? "Changer de clinique" : "Choisir une clinique"}</>}
                  title="Clinique responsable"
                  description="La clinique choisie suivra l'animal et pourra mettre à jour sa fiche."
                  className="mt-4 w-full"
                >
                  <ClinicTransferForm animalId={animal.id} currentClinicId={animal.clinicId} clinics={clinics} />
                </Modal>
              )}
            </div>
          </Card>

          {animal.canEdit && animal.status !== "deceased" && (
            <Card className="space-y-2 p-5">
              <p className="mb-1 text-sm font-semibold text-ink">Actions</p>
              {!pendingTransfer && (
                <Modal trigger={<><ArrowLeftRight className="size-4" /> Transférer la propriété</>} title="Transférer la propriété" description="Le nouveau propriétaire devra accepter le transfert." className="w-full">
                  <TransferForm animalId={animal.id} />
                </Modal>
              )}
              <Modal trigger="Déclarer un décès" title={`Déclarer le décès de ${animal.name}`} className="w-full">
                <DeclareDeathForm animalId={animal.id} />
              </Modal>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
