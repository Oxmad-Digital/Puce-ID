import { PawPrint } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <PawPrint className="mt-10 size-12 text-brand-200" />
      <h1 className="mt-4 text-2xl font-bold text-ink">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">Cette page n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
      <ButtonLink href="/" className="mt-6">Retour à l&apos;accueil</ButtonLink>
    </div>
  );
}
