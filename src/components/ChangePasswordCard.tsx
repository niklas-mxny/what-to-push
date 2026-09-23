"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { translateApiError, useT } from "@/lib/i18n";

const MIN_LENGTH = 8;

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  visible,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  visible: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60"
      />
      {hint && <span className="text-[11px] text-muted-2">{hint}</span>}
    </label>
  );
}

/** Change the password of the signed-in account (the in-app version of scripts/reset-password.mjs). */
export function ChangePasswordCard() {
  const t = useT();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const tooShort = next.length > 0 && next.length < MIN_LENGTH;
  const mismatch = repeat.length > 0 && next !== repeat;
  const canSubmit = current.length > 0 && next.length >= MIN_LENGTH && next === repeat && !saving;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    setDone(false);
    const result = await changePassword(current, next);
    setSaving(false);
    if (!result.ok) {
      setError(translateApiError(t, { message: result.error ?? "", code: result.code }));
      return;
    }
    setCurrent("");
    setNext("");
    setRepeat("");
    setDone(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          {t("settings.password.title")}
        </CardTitle>
        <CardDescription>{t("settings.password.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <PasswordField
            label={t("settings.password.current")}
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            visible={visible}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PasswordField
              label={t("settings.password.new")}
              value={next}
              onChange={setNext}
              autoComplete="new-password"
              visible={visible}
              hint={t("auth.signup.passwordHint")}
            />
            <PasswordField
              label={t("settings.password.repeat")}
              value={repeat}
              onChange={setRepeat}
              autoComplete="new-password"
              visible={visible}
            />
          </div>

          {(tooShort || mismatch || error) && (
            <p className="text-sm text-danger">
              {error ?? (tooShort ? t("errors.weak_password") : t("settings.password.mismatch"))}
            </p>
          )}
          {done && (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <Check className="h-4 w-4" />
              {t("settings.password.success")}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
            >
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {visible ? t("settings.password.hide") : t("settings.password.show")}
            </button>
            <Button type="submit" disabled={!canSubmit}>
              {t("settings.password.submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
