"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Alert, Button, Input } from "@/components/ui";
import { PasswordInput } from "./password-input";
import { GoogleButton, OrSeparator } from "./google-button";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
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
          ? "E-mail ou mot de passe incorrect."
          : (error.message ?? "Connexion impossible pour le moment."),
      );
      return;
    }
    router.push(next?.startsWith("/") ? next : "/espace");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert tone="red">{error}</Alert>}
        <label className="block">
          <span className="field-label">Email</span>
          <Input name="email" type="email" autoComplete="email" required placeholder="nom@exemple.mg" />
        </label>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="field-label mb-0">Mot de passe</span>
            <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-brand-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <PasswordInput name="password" autoComplete="current-password" required placeholder="Votre mot de passe" />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="remember" defaultChecked className="size-4 rounded accent-brand-600" />
          Rester connecté
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Se connecter
        </Button>
      </form>
      <OrSeparator />
      <GoogleButton />
    </>
  );
}
