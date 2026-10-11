/**
 * Configure le CORS du bucket R2 pour autoriser l'envoi direct depuis le navigateur.
 * Usage : npm run r2:cors -- https://votre-domaine.vercel.app
 */
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const origins = ["http://localhost:3000", ...process.argv.slice(2)];
const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

client
  .send(
  new PutBucketCorsCommand({
    Bucket: process.env.R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ["GET", "PUT", "HEAD"],
          AllowedHeaders: ["content-type"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
  )
  .then(() => console.log("CORS R2 configuré pour :", origins.join(", ")))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
