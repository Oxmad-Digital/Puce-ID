import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Créer un compte" };

async function Form({ searchParams }: Pick<PageProps<"/inscription">, "searchParams">) {
  const { role } = await searchParams;
  return <SignupForm defaultRole={role === "vet" ? "vet" : "owner"} />;
}

export default function SignupPage({ searchParams }: PageProps<"/inscription">) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">
        <T fr="Créer un compte" mg="Hamorona kaonty" />
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        <T
          fr="Rejoignez le registre des animaux identifiés par puce."
          mg="Midira ao amin'ny rejisitry ny biby voamarika amin'ny puce."
        />
      </p>
      <Suspense fallback={<SignupForm />}>
        <Form searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-center text-xs text-muted">
        <T fr="Déjà un compte ?" mg="Efa manana kaonty ?" />{" "}
        <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">
          <T fr="Se connecter" mg="Hiditra" />
        </Link>
      </p>
    </>
  );
}
