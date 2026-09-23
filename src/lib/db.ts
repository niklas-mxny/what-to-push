import "server-only";
import { createClient, type Client, type InArgs, type ResultSet } from "@libsql/client";
import path from "node:path";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    username_lower TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    player_tag TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  )`,
  // Players a user saved with the heart button. Keyed by Brawl Stars tag
  // (without '#'), so any player can be saved, not just site members; name
  // and icon are a snapshot from save time for the menu.
  `CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_tag TEXT NOT NULL,
    player_name TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, player_tag)
  )`,
];

/**
 * Online (Vercel) the database is Turso, whose Marketplace integration sets
 * `<PREFIX>_DATABASE_URL` / `<PREFIX>_AUTH_TOKEN` — TURSO_ by default, but the
 * prefix can be changed when connecting, so any libsql:// URL is accepted.
 * Locally it's the SQLite file data/app.db, same schema.
 */
function connectionConfig(): { url: string; authToken?: string } {
  const prefix =
    process.env.TURSO_DATABASE_URL !== undefined
      ? "TURSO"
      : Object.keys(process.env)
          .find((k) => k.endsWith("_DATABASE_URL") && process.env[k]?.startsWith("libsql://"))
          ?.slice(0, -"_DATABASE_URL".length);
  if (prefix) {
    return { url: process.env[`${prefix}_DATABASE_URL`]!, authToken: process.env[`${prefix}_AUTH_TOKEN`] };
  }
  // Vercel's filesystem is read-only and not persisted between requests, so
  // a local file there would silently lose every account.
  if (process.env.VERCEL) {
    throw new Error("No Turso database connected (TURSO_DATABASE_URL is not set). See README.md → Deployment.");
  }
  return { url: `file:${path.join(process.cwd(), "data", "app.db")}` };
}

async function open(): Promise<Client> {
  const config = connectionConfig();
  const client = createClient(config);
  if (config.url.startsWith("file:")) {
    await client.execute("PRAGMA journal_mode = WAL");
    await client.execute("PRAGMA foreign_keys = ON");
  }
  await client.batch(SCHEMA, "write");
  return client;
}

// Next.js dev hot-reload re-evaluates this module on every edit; stash the
// connection on globalThis so we don't open (and leak) a new one each time.
// A failed connect isn't cached, so the next request tries again.
const globalForDb = globalThis as unknown as { __wtpLibsql?: Promise<Client> };

function getDb(): Promise<Client> {
  globalForDb.__wtpLibsql ??= open().catch((err) => {
    globalForDb.__wtpLibsql = undefined;
    throw err;
  });
  return globalForDb.__wtpLibsql;
}

/** Rows as plain objects keyed by column name. */
function rowsOf<T>(result: ResultSet): T[] {
  return result.rows.map((row) => Object.fromEntries(result.columns.map((c, i) => [c, row[i]])) as T);
}

export async function dbAll<T>(sql: string, args: InArgs = []): Promise<T[]> {
  return rowsOf<T>(await (await getDb()).execute({ sql, args }));
}

export async function dbGet<T>(sql: string, args: InArgs = []): Promise<T | undefined> {
  return (await dbAll<T>(sql, args))[0];
}

export async function dbRun(sql: string, args: InArgs = []): Promise<{ lastInsertRowid: number | undefined }> {
  const result = await (await getDb()).execute({ sql, args });
  return { lastInsertRowid: result.lastInsertRowid === undefined ? undefined : Number(result.lastInsertRowid) };
}
