"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Alert, Button, Input } from "@/components/ui";
import { PasswordInput } from "./password-input";
import { GoogleButton, OrSeparator } from "./google-button";
import { T, useT } from "@/components/layout/lang-toggle";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
      rememberMe: form.get("remember") === "on",
    });
    setPending(false);
    if (error) {
      setError(
        error.status === 401 || error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? t("E-mail ou mot de passe incorrect.", "Diso ny mailaka na ny teny miafina.")
          : (error.message ?? t("Connexion impossible pour le moment.", "Tsy afaka miditra amin'izao fotoana izao.")),
      );
      return;
    }
    router.push(next?.startsWith("/") ? next : "/espace");
    router.refresh();
  }

  return (
    <>
      <form method="post" onSubmit={onSubmit} className="space-y-4">
        {error && <Alert tone="red">{error}</Alert>}
        <label className="block">
          <span className="field-label"><T fr="E-mail" mg="Mailaka" /></span>
          <Input name="email" type="email" autoComplete="email" required placeholder={{ fr: "nom@exemple.mg", mg: "anarana@ohatra.mg" }} />
        </label>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="field-label mb-0"><T fr="Mot de passe" mg="Teny miafina" /></span>
            <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-brand-600 hover:underline">
              <T fr="Mot de passe oublié ?" mg="Adino ny teny miafina ?" />
            </Link>
          </div>
          <PasswordInput name="password" autoComplete="current-password" required placeholder={{ fr: "Votre mot de passe", mg: "Ny teny miafinao" }} />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="remember" defaultChecked className="size-4 rounded accent-brand-600" />
          <T fr="Rester connecté" mg="Tsy hivoaka" />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} <T fr="Se connecter" mg="Hiditra" />
        </Button>
      </form>
      <OrSeparator />
      <GoogleButton />
    </>
  );
}
