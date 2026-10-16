import { PawPrint } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/layout/logo";
import { T } from "@/components/layout/lang-toggle";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <PawPrint className="mt-10 size-12 text-brand-200" />
      <h1 className="mt-4 text-2xl font-bold text-ink">
        <T fr="Page introuvable" mg="Tsy hita ny pejy" />
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        <T
          fr="Cette page n'existe pas ou vous n'y avez pas accès."
          mg="Tsy misy ity pejy ity na tsy manana alalana hidirana ao ianao."
        />
      </p>
      <ButtonLink href="/" className="mt-6">
        <T fr="Retour à l'accueil" mg="Hiverina amin'ny fandraisana" />
      </ButtonLink>
    </div>
  );
}
