import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | undefined;

function getDb(): Database {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL manquant : renseignez la chaîne de connexion Neon dans .env.local");
    }
    instance = drizzle({ client: neon(url), schema });
  }
  return instance;
}

/** Client Drizzle initialisé à la première utilisation (le build ne nécessite pas DATABASE_URL). */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export { schema };
