"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/state";
import { Alert, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/layout/lang-toggle";
import { translateMessage } from "@/lib/messages-mg";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

const FormContext = createContext<{ state: ActionState; pending: boolean }>({
  state: {},
  pending: false,
});

/**
 * Formulaire branché sur une Server Action.
 * La saisie est conservée en cas d'erreur de validation (pas de reset automatique).
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  redirectTo,
  successView,
  refresh = true,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  redirectTo?: string;
  /** Remplace le formulaire par ce contenu après succès. */
  successView?: ReactNode;
  refresh?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const lang = useLang();

  useEffect(() => {
    if (!state.ok) return;
    if (resetOnSuccess) ref.current?.reset();
    if (redirectTo) router.push(redirectTo);
    else if (refresh) router.refresh();
  }, [state, resetOnSuccess, redirectTo, refresh, router]);

  if (state.ok && successView) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <CheckCircle2 className="mb-3 size-10 text-emerald-500" />
        <p className="max-w-md text-sm text-ink">{translateMessage(state.message, lang)}</p>
        <div className="mt-5">{successView}</div>
      </div>
    );
  }

  return (
    <FormContext value={{ state, pending }}>
      <form
        ref={ref}
        // POST : un envoi avant hydratation ne doit jamais mettre les champs (mots de passe) dans l'URL.
        method="post"
        className={className}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
      >
        {state.error && (
          <Alert tone="red" className="mb-4">
            {translateMessage(state.error, lang)}
          </Alert>
        )}
        {state.ok && state.message && !successView && (
          <Alert tone="green" className="mb-4">
            {translateMessage(state.message, lang)}
          </Alert>
        )}
        {children}
      </form>
    </FormContext>
  );
}

export function useFormState() {
  return use(FormContext);
}

/** Libellé + champ + message d'erreur issu de la Server Action. */
export function FormField({
  name,
  label,
  required,
  hint,
  children,
  className,
}: {
  name: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { state } = useFormState();
  const error = translateMessage(state.fieldErrors?.[name], useLang());
  return (
    <div className={className}>
      <label className="field-label" htmlFor={name}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className={cn(error && "[&_.field-input]:border-red-300")}>{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & {
  variant?: Parameters<typeof buttonClass>[0];
  size?: Parameters<typeof buttonClass>[1];
}) {
  const { pending } = useFormState();
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
