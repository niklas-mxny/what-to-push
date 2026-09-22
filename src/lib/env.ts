import "server-only";

export class MissingApiTokenError extends Error {
  constructor() {
    super(
      "BRAWL_STARS_API_TOKEN ist nicht gesetzt. Siehe README.md, wie du einen Supercell API Key erstellst und in .env.local einträgst."
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
