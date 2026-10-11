import { FileClock } from "lucide-react";
import { listAccessLog } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { AccessLogTable } from "@/components/app/access-log-table";

export const metadata = { title: "Journal d'accès" };

export default async function JournalPage() {
  const user = await requireRole("vet", "admin");
  const rows = await listAccessLog(user.id, 200);
  return (
    <>
      <PageHeader
        title="Journal d'accès"
        description="Toutes vos actions sur le registre. Chaque consultation de coordonnées y est enregistrée et peut être auditée."
      />
      <Card>
        {rows.length ? <AccessLogTable rows={rows} /> : <EmptyState icon={<FileClock className="size-5" />} title="Journal vide" />}
      </Card>
    </>
  );
}
