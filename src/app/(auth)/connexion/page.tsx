import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Connexion" };

async function Form({ searchParams }: Pick<PageProps<"/connexion">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}

export default function LoginPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">
        <T fr="Connexion" mg="Fidirana" />
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        <T fr="Accédez à votre espace Puce ID." mg="Midira ao amin'ny kaontinao Puce ID." />
      </p>
      <Suspense fallback={<LoginForm />}>
        <Form searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-center text-xs text-muted">
        <T fr="Pas encore de compte ?" mg="Mbola tsy manana kaonty ?" />{" "}
        <Link href="/inscription" className="font-semibold text-brand-600 hover:underline">
          <T fr="Créer un compte" mg="Hamorona kaonty" />
        </Link>
      </p>
    </>
  );
}
