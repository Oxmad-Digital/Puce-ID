import { Mail, ShieldCheck } from "lucide-react";
import { resendInvitation, setClinicRole } from "@/lib/actions/clinics";
import { reviewVet } from "@/lib/actions/vet";
import type { ClinicRole } from "@/lib/db/schema";
import { Avatar, Badge, Button } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/forms/action-form";
import { T } from "@/components/layout/lang-toggle";

export const VET_STATUS = {
  pending: { label: { fr: "Vérification en cours", mg: "Eo am-panamarinana" }, tone: "amber" },
  verified: { label: { fr: "Vérifié", mg: "Voamarina" }, tone: "green" },
  rejected: { label: { fr: "Refusé", mg: "Nolavina" }, tone: "red" },
} as const;

export type ClinicMember = {
  userId: string;
  clinicRole: ClinicRole;
  orderNumber: string;
  status: keyof typeof VET_STATUS;
  user: { id: string; name: string; email: string; mustChangePassword: boolean };
};

/** Équipe d'une clinique : rôle, vérification du n° d'ordre, invitation en attente. */
export function ClinicMembers({
  members,
  canManage,
  isAdmin = false,
}: {
  members: ClinicMember[];
  canManage: boolean;
  isAdmin?: boolean;
}) {
  const managers = members.filter((m) => m.clinicRole === "manager").length;
  return (
    <ul className="divide-y divide-line">
      {members.map((m) => (
        <li key={m.userId} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar name={m.user.name} size="sm" tone="accent" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-ink">
                Dr {m.user.name}
                {m.clinicRole === "manager" && (
                  <Badge tone="brand"><ShieldCheck className="size-3" /> <T fr="Responsable" mg="Tompon'andraikitra" />
                  </Badge>
                )}
              </p>
              <p className="truncate text-[11px] text-muted">
                {m.user.email} · <T fr="N° d'ordre" mg="Laharana (Ordre)" /> <span className="font-mono">{m.orderNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {m.user.mustChangePassword && (
              <Badge tone="gray">
                <Mail className="size-3" /> <T fr="Invitation en attente" mg="Fanasana miandry" />
              </Badge>
            )}
            <Badge tone={VET_STATUS[m.status].tone}><T {...VET_STATUS[m.status].label} /></Badge>
          </div>
          {(canManage || isAdmin) && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {m.user.mustChangePassword && (
                <ActionForm action={resendInvitation.bind(null, m.userId)}>
                  <SubmitButton size="sm" variant="ghost">
                    <T fr="Renvoyer l'invitation" mg="Alefaso indray ny fanasana" />
                  </SubmitButton>
                </ActionForm>
              )}
              {m.clinicRole === "member" ? (
                <form action={setClinicRole.bind(null, m.userId, "manager")}>
                  <Button size="sm" variant="ghost">
                    <T fr="Nommer responsable" mg="Tendreo ho tompon'andraikitra" />
                  </Button>
                </form>
              ) : (
                managers > 1 && (
                  <form action={setClinicRole.bind(null, m.userId, "member")}>
                    <Button size="sm" variant="ghost">
                      <T fr="Retirer responsable" mg="Esory ho tompon'andraikitra" />
                    </Button>
                  </form>
                )
              )}
              {isAdmin && m.status !== "verified" && (
                <ActionForm action={reviewVet.bind(null, m.userId, true)}>
                  <SubmitButton size="sm">
                    <T fr="Valider" mg="Ankatoavy" />
                  </SubmitButton>
                </ActionForm>
              )}
              {isAdmin && m.status !== "rejected" && (
                <ActionForm action={reviewVet.bind(null, m.userId, false)}>
                  <SubmitButton size="sm" variant="ghost">
                    {m.status === "verified" ? <T fr="Suspendre" mg="Ahatoy" /> : <T fr="Refuser" mg="Lavina" />}
                  </SubmitButton>
                </ActionForm>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
