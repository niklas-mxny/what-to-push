// Set a new password for an existing account.
// Usage: node scripts/reset-password.mjs <username>
// Online database: TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… node scripts/reset-password.mjs <username>
// (without them it's the local data/app.db). The password is typed
// interactively (hidden) and hashed exactly like src/lib/auth.ts#hashPassword.
// All of the user's sessions are revoked.

import { randomBytes, scryptSync } from "node:crypto";
import path from "node:path";
import { createInterface } from "node:readline";
import { createClient } from "@libsql/client";

const username = process.argv[2]?.trim();
if (!username) {
  console.error("Usage: node scripts/reset-password.mjs <username>");
  process.exit(1);
}

const db = createClient(
  process.env.TURSO_DATABASE_URL
    ? { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: `file:${path.join(import.meta.dirname, "..", "data", "app.db")}` }
);
const {
  rows: [user],
} = await db.execute({ sql: "SELECT id, username FROM users WHERE username_lower = ?", args: [username.toLowerCase()] });
if (!user) {
  console.error(`No account named "${username}".`);
  process.exit(1);
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (s) => {
      if (!muted) rl.output.write(s);
    };
    rl.question(prompt, (answer) => {
      rl.output.write("\n");
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

const password = await askHidden(`New password for ${user.username}: `);
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
if ((await askHidden("Repeat password: ")) !== password) {
  console.error("Passwords don't match.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
await db.batch(
  [
    { sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [`${salt}:${hash}`, user.id] },
    { sql: "DELETE FROM sessions WHERE user_id = ?", args: [user.id] },
  ],
  "write"
);
console.log(`Password for ${user.username} updated. Existing sessions were signed out.`);
