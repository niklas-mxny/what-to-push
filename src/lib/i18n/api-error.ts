import type { TFunction } from "@/lib/i18n/context";
import type { ApiError } from "@/lib/hooks";

const KNOWN_CODES = new Set([
  "missing_token",
  "invalid_ip",
  "not_found",
  "generic",
  "rotation_generic",
  "roster_generic",
  "invalid_username",
  "weak_password",
  "username_taken",
  "invalid_credentials",
  "not_authenticated",
  "invalid_tag",
  "wrong_password",
]);

/** Translates a server ApiError by its stable `code`; falls back to the raw (English) server message for an unrecognized code. */
export function translateApiError(t: TFunction, err: ApiError): string {
  if (err.code && KNOWN_CODES.has(err.code)) {
    return t(`errors.${err.code}`);
  }
  return err.message;
}
