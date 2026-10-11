/** Compresse les visuels du site et synchronise uniquement les objets R2 manquants. */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

async function main() {
  for (const name of ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]) {
    if (!process.env[name]) throw new Error(`${name} manquant`);
  }
  if (!process.env.R2_ENDPOINT && !process.env.R2_ACCOUNT_ID) {
    throw new Error("R2_ENDPOINT ou R2_ACCOUNT_ID manquant");
  }

  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  const Bucket = process.env.R2_BUCKET ?? "puce-id";
  const images: Record<string, string> = {};
  let originalBytes = 0;
  let compressedBytes = 0;
  const sources = (await readdir("public/images")).filter((name) => /\.(png|jpe?g)$/i.test(name)).sort();

  for (const source of sources) {
    const name = source.replace(/\.(png|jpe?g)$/i, "");
    const original = await readFile(`public/images/${source}`);
    const body = await sharp(original).rotate().webp({ quality: 82, effort: 6 }).toBuffer();
    const hash = createHash("sha256").update(body).digest("hex");
    const Key = `site/images/${name}-${hash.slice(0, 16)}.webp`;
    await writeFile(`public/images/${name}.webp`, body);

    let exists = false;
    try {
      const head = await client.send(new HeadObjectCommand({ Bucket, Key }));
      if (head.Metadata?.sha256 !== hash || head.ContentLength !== body.length || head.ContentType !== "image/webp") {
        throw new Error(`L’objet existant ne correspond pas au fichier : ${Key}`);
      }
      exists = true;
    } catch (error) {
      if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 404) throw error;
    }

    if (!exists) {
      await client.send(new PutObjectCommand({
        Bucket, Key, Body: body, ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: { sha256: hash },
        IfNoneMatch: "*",
      }));
      const head = await client.send(new HeadObjectCommand({ Bucket, Key }));
      if (head.Metadata?.sha256 !== hash || head.ContentLength !== body.length || head.ContentType !== "image/webp") {
        throw new Error(`Vérification R2 échouée : ${Key}`);
      }
    }

    images[name] = Key;
    originalBytes += original.length;
    compressedBytes += body.length;
    console.log(`${name} : ${original.length} → ${body.length} octets, R2 ${exists ? "déjà présent" : "envoyé et vérifié"}`);
  }

  await writeFile("src/lib/site-images.json", `${JSON.stringify(images, null, 2)}\n`);
  console.log(`Total : ${originalBytes} → ${compressedBytes} octets (−${(100 * (1 - compressedBytes / originalBytes)).toFixed(1)} %)`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Échec de la synchronisation R2");
  process.exitCode = 1;
});
