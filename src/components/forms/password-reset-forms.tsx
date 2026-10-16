"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { passwordResetAvailable } from "@/lib/actions/account";
import { Alert, Button, Input } from "@/components/ui";
import { PasswordInput } from "./password-input";
import { T, useT } from "@/components/layout/lang-toggle";

export function ForgotPasswordForm() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <p className="mt-3 text-sm text-ink">
          <T
            fr="Si un compte existe avec cette adresse, vous allez recevoir un lien de réinitialisation."
            mg="Raha misy kaonty mifandraika amin'io adiresy io, hahazo rohy hamerenana ny teny miafina ianao."
          />
        </p>
        <Link href="/connexion" className="mt-5 inline-block text-xs font-semibold text-brand-600 hover:underline">
          <T fr="Retour à la connexion" mg="Hiverina amin'ny fidirana" />
        </Link>
      </div>
    );
  }

  return (
    <form
      method="post"
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email"));
        setPending(true);
        setError(null);
        try {
          if (!(await passwordResetAvailable())) {
            return setError(
              t(
                "L'envoi d'e-mails est momentanément indisponible. Réessayez plus tard ou contactez-nous.",
                "Tsy afaka mandefa mailaka amin'izao fotoana izao. Andramo indray any aoriana na mifandraisa aminay.",
              ),
            );
          }
          const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reinitialiser-mot-de-passe" });
          if (error) return setError(t("La demande a échoué. Réessayez dans un instant.", "Tsy nahomby ny fangatahana. Andramo indray afaka kelikely."));
          setSent(true);
        } finally {
          setPending(false);
        }
      }}
    >
      {error && <Alert tone="red">{error}</Alert>}
      <label className="block">
        <span className="field-label"><T fr="E-mail" mg="Mailaka" /></span>
        <Input name="email" type="email" required autoComplete="email" placeholder={{ fr: "nom@exemple.mg", mg: "anarana@ohatra.mg" }} />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} <T fr="Envoyer le lien" mg="Alefaso ny rohy" />
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <Alert tone="red">
        <T
          fr="Lien invalide ou expiré. Refaites une demande de réinitialisation."
          mg="Rohy tsy mety na lany daty. Mangataha indray famerenana ny teny miafina."
        />
      </Alert>
    );
  }

  return (
    <form
      method="post"
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const newPassword = String(form.get("password"));
        if (newPassword.length < 8) return setError(t("8 caractères minimum.", "Litera 8 farafahakeliny."));
        if (newPassword !== form.get("confirm")) return setError(t("Les mots de passe ne correspondent pas.", "Tsy mitovy ireo teny miafina."));
        setPending(true);
        const { error } = await authClient.resetPassword({ newPassword, token });
        setPending(false);
        if (error) return setError(t("Lien invalide ou expiré.", "Rohy tsy mety na lany daty."));
        router.push("/connexion");
      }}
    >
      {error && <Alert tone="red">{error}</Alert>}
      <label className="block">
        <span className="field-label"><T fr="Nouveau mot de passe" mg="Teny miafina vaovao" /></span>
        <PasswordInput name="password" autoComplete="new-password" />
      </label>
      <label className="block">
        <span className="field-label"><T fr="Confirmer" mg="Hamafiso" /></span>
        <PasswordInput name="confirm" autoComplete="new-password" />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} <T fr="Enregistrer" mg="Tehirizo" />
      </Button>
    </form>
  );
}
