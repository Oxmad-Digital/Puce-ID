import { NextResponse } from "next/server";
import { z } from "zod";
import { createUploadUrl, UPLOAD_RULES } from "@/lib/r2";
import { getCurrentUser } from "@/lib/session";

const bodySchema = z.object({
  folder: z.enum(["animals", "reports", "documents"]),
  fileName: z.string().min(1).max(200),
  contentType: z.string(),
  size: z.number().int().positive(),
});

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "application/pdf": "pdf",
  "text/csv": "csv",
};

/** Renvoie une URL signée pour déposer un fichier directement dans R2. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { folder, contentType, size } = parsed.data;

  // Les photos de signalement perdu/trouvé peuvent être envoyées sans compte.
  const user = await getCurrentUser();
  if (!user && folder !== "reports") {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const rules = folder === "documents" ? UPLOAD_RULES.document : UPLOAD_RULES.image;
  if (!(rules.types as readonly string[]).includes(contentType)) {
    return NextResponse.json({ error: "Format de fichier non accepté" }, { status: 415 });
  }
  if (size > rules.maxSize) {
    return NextResponse.json(
      { error: `Fichier trop volumineux (max ${Math.round(rules.maxSize / 1024 / 1024)} Mo)` },
      { status: 413 },
    );
  }

  const key = `${folder}/${crypto.randomUUID()}.${EXT[contentType] ?? "bin"}`;
  const url = await createUploadUrl(key, contentType);
  return NextResponse.json({ key, url });
}
