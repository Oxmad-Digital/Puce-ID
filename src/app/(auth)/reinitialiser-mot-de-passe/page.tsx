import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/password-reset-forms";

export const metadata = { title: "Nouveau mot de passe" };

async function Form({ searchParams }: Pick<PageProps<"/reinitialiser-mot-de-passe">, "searchParams">) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : undefined} />;
}

export default function ResetPasswordPage({ searchParams }: PageProps<"/reinitialiser-mot-de-passe">) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Nouveau mot de passe</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Choisissez un mot de passe d&apos;au moins 8 caractères.</p>
      <Suspense fallback={null}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}
