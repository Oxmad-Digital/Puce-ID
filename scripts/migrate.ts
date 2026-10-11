/**
 * Applique les migrations du dossier ./drizzle (connexion WebSocket Neon, transactionnelle).
 * Usage : npm run db:migrate
 */
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" })
  .then(() => console.log("Migrations appliquées."))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
