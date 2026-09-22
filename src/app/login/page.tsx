"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? t("errors.invalid_credentials"));
      return;
    }
    router.push(`/profile/${username}`);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("auth.login.title")}</h1>
        <p className="text-sm text-muted">{t("auth.login.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.noAccount")} <Link href="/signup" className="text-primary underline">{t("nav.signup")}</Link></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("auth.login.usernameLabel")}</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm outline-none"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("auth.login.passwordLabel")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm outline-none"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {t("auth.login.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
