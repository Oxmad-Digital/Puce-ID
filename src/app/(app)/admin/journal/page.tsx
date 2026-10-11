import { listAccessLog } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { Card, PageHeader } from "@/components/ui";
import { AccessLogTable } from "@/components/app/access-log-table";

export const metadata = { title: "Journal d'accès global" };

export default async function AdminJournalPage() {
  await requireRole("admin");
  const rows = await listAccessLog(null, 300);
  return (
    <>
      <PageHeader title="Journal d'accès" description="Audit de toutes les actions sur le registre (300 dernières)" />
      <Card><AccessLogTable rows={rows} showActor /></Card>
    </>
  );
}
