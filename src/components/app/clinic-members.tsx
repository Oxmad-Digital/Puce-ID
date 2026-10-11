import { Mail, ShieldCheck } from "lucide-react";
import { resendInvitation, setClinicRole } from "@/lib/actions/clinics";
import { reviewVet } from "@/lib/actions/vet";
import type { ClinicRole } from "@/lib/db/schema";
import { Avatar, Badge, Button } from "@/components/ui";

export const VET_STATUS = {
  pending: { label: "Vérification en cours", tone: "amber" },
  verified: { label: "Vérifié", tone: "green" },
  rejected: { label: "Refusé", tone: "red" },
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
                  <Badge tone="brand"><ShieldCheck className="size-3" /> Responsable</Badge>
                )}
              </p>
              <p className="truncate text-[11px] text-muted">
                {m.user.email} · N° d&apos;ordre <span className="font-mono">{m.orderNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {m.user.mustChangePassword && <Badge tone="gray"><Mail className="size-3" /> Invitation en attente</Badge>}
            <Badge tone={VET_STATUS[m.status].tone}>{VET_STATUS[m.status].label}</Badge>
          </div>
          {(canManage || isAdmin) && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {m.user.mustChangePassword && (
                <form action={resendInvitation.bind(null, m.userId)}>
                  <Button size="sm" variant="ghost">Renvoyer l&apos;invitation</Button>
                </form>
              )}
              {m.clinicRole === "member" ? (
                <form action={setClinicRole.bind(null, m.userId, "manager")}>
                  <Button size="sm" variant="ghost">Nommer responsable</Button>
                </form>
              ) : (
                managers > 1 && (
                  <form action={setClinicRole.bind(null, m.userId, "member")}>
                    <Button size="sm" variant="ghost">Retirer responsable</Button>
                  </form>
                )
              )}
              {isAdmin && m.status !== "verified" && (
                <form action={reviewVet.bind(null, m.userId, true)}><Button size="sm">Valider</Button></form>
              )}
              {isAdmin && m.status !== "rejected" && (
                <form action={reviewVet.bind(null, m.userId, false)}>
                  <Button size="sm" variant="ghost">{m.status === "verified" ? "Suspendre" : "Refuser"}</Button>
                </form>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
