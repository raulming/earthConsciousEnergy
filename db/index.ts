import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  if (!schemaReady) {
    schemaReady = env.DB.exec([
      "CREATE TABLE IF NOT EXISTS admin_credentials (username text PRIMARY KEY NOT NULL, password_salt text NOT NULL, password_hash text NOT NULL, password_iterations integer NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL);",
      "CREATE TABLE IF NOT EXISTS progress_updates (id text PRIMARY KEY NOT NULL, date text NOT NULL, energy integer NOT NULL, note text DEFAULT '' NOT NULL, breakthrough integer DEFAULT false NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL);",
    ].join("\n")).then(() => undefined).catch((error) => {
      schemaReady = null;
      console.error("[database] Unable to prepare the application schema", error);
      throw error;
    });
  }
  await schemaReady;
}

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}
