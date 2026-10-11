import { ForgotPasswordForm } from "@/components/forms/password-reset-forms";

export const metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Mot de passe oublié</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Indiquez votre e-mail, nous vous envoyons un lien pour en choisir un nouveau.</p>
      <ForgotPasswordForm />
    </>
  );
}
