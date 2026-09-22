/**
 * Normalizes a player tag: accepts with/without leading '#', trims whitespace,
 * uppercases. Tags are stored and put in URLs in this form (no '#').
 */
export function normalizePlayerTag(rawTag: string): string {
  return rawTag.trim().toUpperCase().replace(/^#/, "");
}
