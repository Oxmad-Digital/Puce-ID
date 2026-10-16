import { ForgotPasswordForm } from "@/components/forms/password-reset-forms";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">
        <T fr="Mot de passe oublié" mg="Adino ny teny miafina" />
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        <T
          fr="Indiquez votre e-mail, nous vous envoyons un lien pour en choisir un nouveau."
          mg="Ampidiro ny mailakao, handefa rohy ahafahanao misafidy teny miafina vaovao izahay."
        />
      </p>
      <ForgotPasswordForm />
    </>
  );
}
