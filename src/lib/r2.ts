import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | undefined;

function r2(): S3Client {
  if (!client) {
    const endpoint =
      process.env.R2_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return client;
}

const bucket = () => process.env.R2_BUCKET ?? "puce-id";

export const UPLOAD_RULES = {
  image: {
    maxSize: 8 * 1024 * 1024,
    types: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  },
  document: {
    maxSize: 15 * 1024 * 1024,
    types: ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/csv"],
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

/** URL signée pour un envoi direct navigateur → R2 (PUT). */
export async function createUploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn: 60 * 5 },
  );
}

/** URL de lecture : publique si R2_PUBLIC_URL est défini, sinon signée (1 h). */
export async function getFileUrl(key: string, downloadName?: string) {
  if (process.env.R2_PUBLIC_URL && !downloadName) {
    return `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return getSignedUrl(
    r2(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ResponseContentDisposition: downloadName
        ? `attachment; filename="${encodeURIComponent(downloadName)}"`
        : undefined,
    }),
    { expiresIn: 60 * 60 },
  );
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await r2().send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject(key: string) {
  await r2().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
