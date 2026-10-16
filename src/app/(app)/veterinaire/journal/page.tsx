import { FileClock } from "lucide-react";
import { listAccessLog } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { AccessLogTable } from "@/components/app/access-log-table";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Journal d'accès" };

export default async function JournalPage() {
  const user = await requireRole("vet", "admin");
  const rows = await listAccessLog(user.id, 200);
  return (
    <>
      <PageHeader
        title={<T fr="Journal d'accès" mg="Diarin'ny fidirana" />}
        description={
          <T
            fr="Toutes vos actions sur le registre. Chaque consultation de coordonnées y est enregistrée et peut être auditée."
            mg="Ny hetsika rehetra nataonao tao amin'ny rejisitra. Voasoratra eto ny fijerena fifandraisana tsirairay ary azo hamarinina."
          />
        }
      />
      <Card>
        {rows.length ? <AccessLogTable rows={rows} /> : <EmptyState icon={<FileClock className="size-5" />} title={<T fr="Journal vide" mg="Tsy misy na inona na inona ao amin'ny diary" />} />}
      </Card>
    </>
  );
}
