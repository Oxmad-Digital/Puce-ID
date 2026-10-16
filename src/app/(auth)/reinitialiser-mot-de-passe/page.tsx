import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/password-reset-forms";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Nouveau mot de passe" };

async function Form({ searchParams }: Pick<PageProps<"/reinitialiser-mot-de-passe">, "searchParams">) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : undefined} />;
}

export default function ResetPasswordPage({ searchParams }: PageProps<"/reinitialiser-mot-de-passe">) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">
        <T fr="Nouveau mot de passe" mg="Teny miafina vaovao" />
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        <T
          fr="Choisissez un mot de passe d'au moins 8 caractères."
          mg="Misafidiana teny miafina misy litera 8 farafahakeliny."
        />
      </p>
      <Suspense fallback={null}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}
