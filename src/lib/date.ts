/**
 * The Supercell API returns timestamps in a compact, non-standard format
 * ("20260923T080000.000Z" — no dashes/colons), which `new Date()` can't parse
 * (silently yields an Invalid Date). This normalizes it to real ISO 8601.
 */
export function parseSupercellTimestamp(raw: string): string {
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\.\d+)?Z?$/);
  if (!m) return raw;
  const [, year, month, day, hour, minute, second, fraction] = m;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${fraction ?? ".000"}Z`;
}
