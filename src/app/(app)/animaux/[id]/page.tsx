import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertTriangle, ArrowLeftRight, Building2, Cpu, FileText, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { markFound, removeDocument } from "@/lib/actions/animals";
import { getAnimal, listActiveClinics } from "@/lib/data/queries";
import { homeFor, requireUser } from "@/lib/session";
import { CHIP_LOCATION_MG, OWNERSHIP_EVENT, SEX_LABEL, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { FmtAge, FmtDate } from "@/components/dates";
import { fileHref, formatChip } from "@/lib/utils";
import { Alert, Avatar, Badge, Button, ButtonLink, Card, CardHeader, InfoItem, PageHeader, StatusBadge } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ClinicTransferForm, DeclareDeathForm, DeclareLostForm, TransferForm } from "@/components/app/animal-actions";
import { DocumentsUploader } from "@/components/app/documents-uploader";

export const metadata = { title: "Fiche animal" };

export default async function AnimalPage({ params, searchParams }: PageProps<"/animaux/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const { invitation } = await searchParams;
  const animal = await getAnimal(user, id);
  if (!animal) notFound();
  await connection();
  const now = new Date();

  const isOwner = animal.ownerId === user.id;
  const isVet = user.role === "vet";
  const vetName = animal.implantedBy ? `Dr ${animal.implantedBy.name}` : animal.implantedByName;
  const pendingTransfer = animal.transfers[0];
  const pendingClinicTransfer = animal.clinicTransfers[0];
  const canChangeClinic =
    user.role === "admin" || isOwner || animal.isClinicVet || (animal.clinicId === null && animal.canEdit);
  const clinics = canChangeClinic && !pendingClinicTransfer ? await listActiveClinics() : [];
  const subtitle = [
    <T key="species" {...speciesLabel(animal.species)} />,
    animal.breed,
    <T key="sex" {...SEX_LABEL[animal.sex]} />,
    animal.birthDate && <FmtAge key="age" birth={animal.birthDate} now={now} />,
  ]
    .filter(Boolean)
    .flatMap((part, i) => (i ? [" · ", part] : [part]));

  return (
    <>
      <PageHeader
        title=""
        breadcrumb={[
          {
            label: isVet ? <T fr="Mes patients" mg="Ireo marariko" /> : <T fr="Mes animaux" mg="Ireo bibiko" />,
            href: isVet ? "/veterinaire/patients" : homeFor(user.role) === "/admin" ? "/admin" : "/mes-animaux" },
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
              {animal.ownerConfirmed ? (
                <Badge tone="brand">
                  <T fr="Propriétaire confirmé" mg="Tompony voamafy" />
                </Badge>
              ) : (
                <Badge tone="amber">
                  <T fr="Propriétaire à confirmer" mg="Tompony mbola hamafisina" />
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {animal.canEdit && (
            <ButtonLink href={`/animaux/${animal.id}/modifier`} variant="secondary" size="sm"><Pencil className="size-3.5" /> <T fr="Modifier" mg="Hanova" />
            </ButtonLink>
          )}
          {isOwner && animal.status === "alive" && (
            <Modal
              trigger={<T fr="Déclarer disparu" mg="Ambarao fa very" />}
              title={<T fr={`Déclarer ${animal.name} disparu`} mg={`Ambarao fa very i ${animal.name}`} />}
              description={
                <T
                  fr="L'alerte s'affichera pour toute personne qui scanne sa puce."
                  mg="Hiseho amin'izay rehetra mi-scan ny puce-ny ny fampitandremana."
                />
              }
              variant="dangerSoft"
              size="sm"
            >
              <DeclareLostForm animalId={animal.id} />
            </Modal>
          )}
        </div>
      </Card>

      {invitation === "echec" && (
        <Alert tone="amber" className="mb-6">
          <T
            fr="La fiche est enregistrée et un compte a été créé pour le propriétaire, mais l'e-mail d'invitation n'a pas pu être envoyé. Contactez l'administration pour le renvoyer."
            mg="Voatahiry ny fiche ary nisy kaonty noforonina ho an'ny tompony, saingy tsy lasa ny mailaka fanasana. Mifandraisa amin'ny mpitantana mba handefa azy indray."
          />
        </Alert>
      )}
      {(animal.status === "lost" || animal.status === "found") && (
        <Alert tone={animal.status === "lost" ? "red" : "brand"} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            {animal.status === "lost" ? (
              <T fr={`${animal.name} est déclaré disparu.`} mg={`Nambara fa very i ${animal.name}.`} />
            ) : (
              <T fr={`${animal.name} a été signalé trouvé.`} mg={`Nambara fa hita i ${animal.name}.`} />
            )}
          </span>
          {animal.canEdit && (
            <form action={markFound.bind(null, animal.id)}>
              <Button size="sm" variant="secondary">
                <T fr="Il est de retour à la maison" mg="Efa tafaverina any an-trano izy" />
              </Button>
            </form>
          )}
        </Alert>
      )}
      {pendingTransfer && (
        <Alert tone="amber" className="mb-6">
          <T fr="Transfert en attente vers" mg="Famindrana miandry ho any amin'i" /> <strong>{pendingTransfer.toName}</strong> —{" "}
          <T fr="expire le" mg="lany daty amin'ny" /> <FmtDate value={pendingTransfer.expiresAt} />.
        </Alert>
      )}
      {pendingClinicTransfer && (
        <Alert tone="amber" className="mb-6">
          <T fr="Changement de clinique en attente vers" mg="Fiovana toeram-pitsaboana miandry ho any amin'ny" />{" "}
          <strong>{pendingClinicTransfer.toClinic.name}</strong> ({pendingClinicTransfer.toClinic.city}) —{" "}
          <T fr="expire le" mg="lany daty amin'ny" /> <FmtDate value={pendingClinicTransfer.expiresAt} />.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title={<T fr="Informations générales" mg="Fampahalalana ankapobeny" />} />
            <dl className="grid grid-cols-2 gap-5 p-5 sm:grid-cols-4">
              <InfoItem label={<T fr="Espèce" mg="Karazana" />} value={<T {...speciesLabel(animal.species)} />} />
              <InfoItem label={<T fr="Race" mg="Fokom-biby" />} value={animal.breed} />
              <InfoItem label={<T fr="Sexe" mg="Lahy sa vavy" />} value={<T {...SEX_LABEL[animal.sex]} />} />
              <InfoItem label={<T fr="Couleur" mg="Loko" />} value={animal.color} />
              <InfoItem label={<T fr="Date de naissance" mg="Daty nahaterahana" />} value={<FmtDate value={animal.birthDate} />} />
              <InfoItem label={<T fr="Statut" mg="Toetra" />} value={<StatusBadge status={animal.status} />} />
              <InfoItem label={<T fr="Enregistré le" mg="Daty nanoratana" />} value={<FmtDate value={animal.createdAt} />} />
              <InfoItem label={<T fr="Vétérinaire poseur" mg="Dokotera nametraka" />} value={vetName} />
              <InfoItem
                label={<T fr="Clinique responsable" mg="Toeram-pitsaboana tompon'andraikitra" />}
                value={animal.clinic ? `${animal.clinic.name}, ${animal.clinic.city}` : <T fr="Aucune" mg="Tsy misy" />}
              />
              {animal.deceasedAt && (
                <InfoItem label={<T fr="Date du décès" mg="Daty nahafatesana" />} value={<FmtDate value={animal.deceasedAt} />} />
              )}
            </dl>
          </Card>

          <Card>
            <CardHeader title={<T fr="Historique de propriété" mg="Tantaran'ny fananana" />} />
            <ol className="space-y-5 p-5">
              {animal.history.map((h, i) => (
                <li key={h.id} className="relative flex gap-3">
                  <span className={`mt-1 size-2.5 shrink-0 rounded-full ${i === 0 ? "bg-brand-600 ring-4 ring-brand-100" : "bg-brand-200"}`} />
                  {i < animal.history.length - 1 && <span className="absolute left-[4.5px] top-4 h-[calc(100%+0.5rem)] w-px bg-line" />}
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      <T {...OWNERSHIP_EVENT[h.event]} /> · {h.ownerName}
                    </p>
                    <p className="text-xs text-muted">
                      <FmtDate value={h.occurredAt} />
                      {h.note && ` · ${h.note}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader
              title={<T fr="Documents" mg="Antontan-taratasy" />}
              description={
                <T
                  fr="Certificats, carnet de vaccination… (PDF ou image)"
                  mg="Taratasy fanamarinana, karine vaksiny… (PDF na sary)"
                />
              }
              action={animal.canEdit && <DocumentsUploader animalId={animal.id} />}
            />
            {animal.documents.length ? (
              <ul className="divide-y divide-line">
                {animal.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                    <FileText className="size-4 text-brand-600" />
                    <a href={`/api/files/${d.key}`} target="_blank" className="min-w-0 flex-1 truncate text-sm text-ink hover:text-brand-700">{d.fileName}</a>
                    <span className="text-[11px] text-muted">{Math.ceil(d.size / 1024)} Ko · <FmtDate value={d.createdAt} /></span>
                    {animal.canEdit && (
                      <form action={removeDocument.bind(null, d.id)}>
                        <button aria-label="Supprimer" className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-center text-xs text-muted">
                <T fr="Aucun document." mg="Tsy misy antontan-taratasy." />
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <div className="rounded-[var(--radius-card)] bg-brand-800 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/70">
                <T fr="Puce électronique" mg="Puce elektronika" />
              </p>
              <Cpu className="size-4 text-white/60" />
            </div>
            <p className="mt-3 font-mono text-xl font-bold tracking-wider">{formatChip(animal.chipNumber)}</p>
            <p className="mt-2 text-xs text-white/70">
              <T fr="Posée le" mg="Napetraka ny" /> <FmtDate value={animal.chipImplantedAt} />
              {animal.chipLocation && (
                <>
                  {" · "}
                  <T fr={animal.chipLocation} mg={CHIP_LOCATION_MG[animal.chipLocation] ?? animal.chipLocation} />
                </>
              )}
            </p>
            {vetName && (
              <p className="text-xs text-white/70">
                <T fr="Vétérinaire" mg="Dokotera" /> : {vetName}{animal.implantedBy?.vetProfile ? ` — ${animal.implantedBy.vetProfile.clinic.name}` : ""}
              </p>
            )}
            <Badge tone="amber" className="mt-3 bg-accent-500 text-white ring-0">ISO 11784</Badge>
          </div>

          <Card>
            <CardHeader title={<T fr="Propriétaire" mg="Tompony" />} />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={animal.ownerName} />
                <div>
                  <p className="text-sm font-semibold text-ink">{animal.ownerName}</p>
                  <p className="text-xs text-muted">{animal.ownerCity ?? "—"}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-3">
                <InfoItem label={<T fr="Téléphone" mg="Telefaonina" />} value={animal.ownerPhone} />
                <InfoItem label={<T fr="E-mail" mg="Mailaka" />} value={animal.ownerEmail} />
              </dl>
              {!isOwner && (animal.ownerPhone || animal.ownerEmail) && (
                <ButtonLink
                  href={animal.ownerPhone ? `tel:${animal.ownerPhone.replace(/\s/g, "")}` : `mailto:${animal.ownerEmail}`}
                  className="mt-4 w-full"
                >
                  {animal.ownerPhone ? <Phone className="size-4" /> : <Mail className="size-4" />}{" "}
                  <T fr="Contacter le propriétaire" mg="Hifandray amin'ny tompony" />
                </ButtonLink>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                <T
                  fr="Visible uniquement par le propriétaire et les vétérinaires vérifiés. Chaque consultation est enregistrée dans le journal d'accès."
                  mg="Ny tompony sy ny dokotera voamarina ihany no mahita izany. Voasoratra ao amin'ny diarin'ny fidirana ny fijerena tsirairay."
                />
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title={<T fr="Clinique responsable" mg="Toeram-pitsaboana tompon'andraikitra" />} />
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
                <p className="text-xs text-muted">
                  <T
                    fr="Aucune clinique ne suit actuellement cet animal."
                    mg="Tsy misy toeram-pitsaboana manaraka ity biby ity amin'izao fotoana izao."
                  />
                </p>
              )}
              {canChangeClinic && !pendingClinicTransfer && animal.status !== "deceased" && (
                <Modal
                  trigger={
                    <>
                      <Building2 className="size-4" />{" "}
                      {animal.clinic ? (
                        <T fr="Changer de clinique" mg="Hanova toeram-pitsaboana" />
                      ) : (
                        <T fr="Choisir une clinique" mg="Hisafidy toeram-pitsaboana" />
                      )}
                    </>
                  }
                  title={<T fr="Clinique responsable" mg="Toeram-pitsaboana tompon'andraikitra" />}
                  description={
                    <T
                      fr="La clinique choisie suivra l'animal et pourra mettre à jour sa fiche."
                      mg="Ny toeram-pitsaboana voafidy no hanaraka ny biby ary afaka hanavao ny fiche-ny."
                    />
                  }
                  className="mt-4 w-full"
                >
                  <ClinicTransferForm animalId={animal.id} currentClinicId={animal.clinicId} clinics={clinics} />
                </Modal>
              )}
            </div>
          </Card>

          {animal.canEdit && animal.status !== "deceased" && (
            <Card className="space-y-2 p-5">
              <p className="mb-1 text-sm font-semibold text-ink">
                <T fr="Actions" mg="Hetsika" />
              </p>
              {!pendingTransfer && (
                <Modal
                  trigger={
                    <>
                      <ArrowLeftRight className="size-4" /> <T fr="Transférer la propriété" mg="Hamindra ny fananana" />
                    </>
                  }
                  title={<T fr="Transférer la propriété" mg="Hamindra ny fananana" />}
                  description={
                    <T fr="Le nouveau propriétaire devra accepter le transfert." mg="Tsy maintsy manaiky ny famindrana ny tompony vaovao." />
                  }
                  className="w-full"
                >
                  <TransferForm animalId={animal.id} />
                </Modal>
              )}
              <Modal
                trigger={<T fr="Déclarer un décès" mg="Hanambara fahafatesana" />}
                title={<T fr={`Déclarer le décès de ${animal.name}`} mg={`Ambarao ny fahafatesan'i ${animal.name}`} />}
                className="w-full"
              >
                <DeclareDeathForm animalId={animal.id} />
              </Modal>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
