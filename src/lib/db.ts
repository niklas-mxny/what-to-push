import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

// Next.js dev hot-reload re-evaluates this module on every edit; stash the
// connection on globalThis so we don't open (and leak) a new one each time.
const globalForDb = globalThis as unknown as { __wtpDb?: DatabaseSync };

function open(): DatabaseSync {
  if (globalForDb.__wtpDb) return globalForDb.__wtpDb;

  const dbPath = path.join(process.cwd(), "data", "app.db");
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      username_lower TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      player_tag TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    -- Players a user saved with the heart button. Keyed by Brawl Stars tag
    -- (without '#'), so any player can be saved, not just site members; name
    -- and icon are a snapshot from save time for the menu.
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,
      icon_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, player_tag)
    );
  `);

  globalForDb.__wtpDb = db;
  return db;
}

export function getDb(): DatabaseSync {
  return open();
}
