"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, RTL_LOCALES, isLocaleCode, type LocaleCode } from "@/lib/i18n/locales";

export type TParams = Record<string, string | number>;
export type TFunction = (key: string, params?: TParams) => string;

const STORAGE_KEY = "wtp_locale";
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// Same "cache the parsed snapshot" requirement as src/lib/storage.ts — return
// a stable reference when nothing changed, or useSyncExternalStore re-renders forever.
let cached: { raw: string | null; value: LocaleCode } | null = null;

function readLocale(): LocaleCode {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (cached && cached.raw === raw) return cached.value;
  const value = raw && isLocaleCode(raw) ? raw : DEFAULT_LOCALE;
  cached = { raw, value };
  return value;
}

function useLocaleState(): [LocaleCode, (l: LocaleCode) => void] {
  const locale = useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);
  const setLocale = useCallback((l: LocaleCode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // localStorage unavailable — falls back to the default locale for this tab.
    }
    emitChange();
  }, []);
  return [locale, setLocale];
}

function format(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useLocaleState();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const t = useCallback<TFunction>(
    (key, params) => {
      const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
      const template = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
      return format(template, params);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT(): TFunction {
  return useI18n().t;
}
