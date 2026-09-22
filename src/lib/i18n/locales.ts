// Biggest global/gaming-market languages. UI chrome only — brawler, map and
// mode names come from the Supercell/BrawlAPI data in English and are left
// as-is (translating game content would need a separate per-language name
// mapping we don't have a data source for).
export const LOCALES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "ar", name: "العربية" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

export const RTL_LOCALES: readonly LocaleCode[] = ["ar"];

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}
