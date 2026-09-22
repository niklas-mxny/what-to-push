import type { LocaleCode } from "@/lib/i18n/locales";
import ar from "./ar";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import ja from "./ja";
import ko from "./ko";
import pt from "./pt";
import ru from "./ru";
import zh from "./zh";

export const dictionaries: Record<LocaleCode, Record<string, string>> = {
  en,
  es,
  pt,
  fr,
  de,
  ru,
  ja,
  ko,
  zh,
  ar,
};
