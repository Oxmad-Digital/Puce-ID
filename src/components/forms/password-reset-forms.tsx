"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Alert, Button, Input } from "@/components/ui";
import { PasswordInput } from "./password-input";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <p className="mt-3 text-sm text-ink">
          Si un compte existe avec cette adresse, vous allez recevoir un lien de réinitialisation.
        </p>
        <Link href="/connexion" className="mt-5 inline-block text-xs font-semibold text-brand-600 hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        await authClient.requestPasswordReset({
          email: String(new FormData(e.currentTarget).get("email")),
          redirectTo: "/reinitialiser-mot-de-passe",
        });
        setPending(false);
        setSent(true);
      }}
    >
      <label className="block">
        <span className="field-label">Email</span>
        <Input name="email" type="email" required autoComplete="email" placeholder="nom@exemple.mg" />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Envoyer le lien
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!token) {
    return <Alert tone="red">Lien invalide ou expiré. Refaites une demande de réinitialisation.</Alert>;
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const newPassword = String(form.get("password"));
        if (newPassword.length < 8) return setError("8 caractères minimum.");
        if (newPassword !== form.get("confirm")) return setError("Les mots de passe ne correspondent pas.");
        setPending(true);
        const { error } = await authClient.resetPassword({ newPassword, token });
        setPending(false);
        if (error) return setError("Lien invalide ou expiré.");
        router.push("/connexion");
      }}
    >
      {error && <Alert tone="red">{error}</Alert>}
      <label className="block">
        <span className="field-label">Nouveau mot de passe</span>
        <PasswordInput name="password" autoComplete="new-password" />
      </label>
      <label className="block">
        <span className="field-label">Confirmer</span>
        <PasswordInput name="confirm" autoComplete="new-password" />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Enregistrer
      </Button>
    </form>
  );
}
