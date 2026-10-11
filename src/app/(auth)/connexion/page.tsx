import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = { title: "Connexion" };

async function Form({ searchParams }: Pick<PageProps<"/connexion">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}

export default function LoginPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Connexion</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Accédez à votre espace Puce ID.</p>
      <Suspense fallback={<LoginForm />}>
        <Form searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-center text-xs text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
