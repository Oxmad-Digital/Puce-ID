import { Suspense } from "react";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Skeleton } from "@/components/ui";
import { FirstLoginForm } from "@/components/forms/settings-forms";

export const metadata = { title: "Choisir votre mot de passe" };

/** Première connexion d'un compte invité : le mot de passe provisoire doit être remplacé. */
async function FirstLogin() {
  const user = await requireUser({ allowTemporaryPassword: true });
  if (!user.mustChangePassword) redirect("/espace");
  return (
    <>
      <p className="mt-1 mb-6 text-sm text-muted">
        Bienvenue {user.name} ! Vous vous êtes connecté avec un mot de passe provisoire. Choisissez maintenant votre
        propre mot de passe pour accéder à votre espace.
      </p>
      <FirstLoginForm />
    </>
  );
}

export default function FirstLoginPage() {
  return (
    <>
      <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <KeyRound className="size-5" />
      </span>
      <h1 className="text-2xl font-bold text-ink">Choisissez votre mot de passe</h1>
      <Suspense fallback={<Skeleton className="mt-6 h-56" />}>
        <FirstLogin />
      </Suspense>
    </>
  );
}
