"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

export default function SignupPage() {
  const t = useT();
  const router = useRouter();
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signup(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? t("errors.invalid_username"));
      return;
    }
    router.push(`/profile/${username}`);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("auth.signup.title")}</h1>
        <p className="text-sm text-muted">{t("auth.signup.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("auth.signup.title")}</CardTitle>
          <CardDescription>{t("auth.signup.haveAccount")} <Link href="/login" className="text-primary underline">{t("nav.login")}</Link></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("auth.signup.usernameLabel")}</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm outline-none"
                autoComplete="username"
                required
              />
              <p className="mt-1 text-[11px] text-muted-2">{t("auth.signup.usernameHint")}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("auth.signup.passwordLabel")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm outline-none"
                autoComplete="new-password"
                required
              />
              <p className="mt-1 text-[11px] text-muted-2">{t("auth.signup.passwordHint")}</p>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {t("auth.signup.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
