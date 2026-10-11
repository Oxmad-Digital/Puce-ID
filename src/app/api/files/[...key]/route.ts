import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getFileUrl } from "@/lib/r2";
import { getAnimal } from "@/lib/data/queries";
import { getCurrentUser } from "@/lib/session";

/**
 * Redirige vers le fichier R2.
 * Photos (animals/, reports/) : accès libre — clés aléatoires non devinables.
 * Documents (documents/) : réservés aux personnes ayant accès à la fiche de l'animal.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/files/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  const folder = parts[0];

  if (folder === "animals" || folder === "reports") {
    return NextResponse.redirect(await getFileUrl(key), 302);
  }

  if (folder === "documents") {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Non autorisé", { status: 401 });
    const doc = await db.query.document.findFirst({ where: eq(schema.document.key, key) });
    if (!doc) return new NextResponse("Introuvable", { status: 404 });
    const animal = await getAnimal(user, doc.animalId);
    if (!animal) return new NextResponse("Non autorisé", { status: 403 });
    return NextResponse.redirect(await getFileUrl(key, doc.fileName), 302);
  }

  return new NextResponse("Introuvable", { status: 404 });
}
