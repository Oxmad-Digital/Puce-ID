import { listAccessLog } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { Card, PageHeader } from "@/components/ui";
import { AccessLogTable } from "@/components/app/access-log-table";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Journal d'accès global" };

export default async function AdminJournalPage() {
  await requireRole("admin");
  const rows = await listAccessLog(null, 300);
  return (
    <>
      <PageHeader
        title={<T fr="Journal d'accès" mg="Diarin'ny fidirana" />}
        description={
          <T
            fr="Audit de toutes les actions sur le registre (300 dernières)"
            mg="Fanaraha-maso ny hetsika rehetra tao amin'ny rejisitra (300 farany)"
          />
        }
      />
      <Card><AccessLogTable rows={rows} showActor /></Card>
    </>
  );
}
