import "server-only";

export class MissingApiTokenError extends Error {
  constructor() {
    super(
      "BRAWL_STARS_API_TOKEN is not set. See README.md for how to create a Supercell API key and add it to .env.local."
    );
    this.name = "MissingApiTokenError";
  }
}

export function getApiToken(): string {
  const token = process.env.BRAWL_STARS_API_TOKEN;
  if (!token) {
    throw new MissingApiTokenError();
  }
  return token;
}
