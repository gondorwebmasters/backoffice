"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { HeroAnimation } from "@/components/layout/hero-animation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailOrNickname, setEmailOrNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrNickname, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? t("authError"));
        return;
      }
      router.push(searchParams.get("next") ?? "/");
      router.refresh();
    } catch {
      setError(t("connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-1">
        <HeroAnimation />
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">FitConnect</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-pop">
        <Field label={t("emailOrUsername")}>
          <Input
            value={emailOrNickname}
            onChange={(event) => setEmailOrNickname(event.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </Field>
        <Field label={t("password")}>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? t("loggingIn") : t("login")}
        </Button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
