"use client";

import { startTransition, useActionState } from "react";
import { CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
import { importCsv, type ImportResult } from "@/lib/actions/vet";
import { Alert, Button } from "@/components/ui";

export function CsvImportForm() {
  const [state, action, pending] = useActionState<ImportResult, FormData>(importCsv, {});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-10 text-center hover:bg-brand-50">
        <FileSpreadsheet className="size-8 text-brand-500" />
        <span className="text-sm font-semibold text-ink">Choisir un fichier CSV</span>
        <span className="text-xs text-muted">Séparateur virgule ou point-virgule · 2 Mo max</span>
        <input type="file" name="file" accept=".csv,text/csv" required className="mt-2 text-xs" />
      </label>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Importer
      </Button>
      {state.error && <Alert tone="red">{state.error}</Alert>}
      {state.ok && (
        <Alert tone="green">
          <span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" /> {state.message}</span>
        </Alert>
      )}
      {state.errors && state.errors.length > 0 && (
        <Alert tone="amber">
          <p className="mb-1 font-semibold">{state.errors.length} ligne(s) ignorée(s) :</p>
          <ul className="max-h-48 space-y-0.5 overflow-auto">
            {state.errors.map((e, i) => (
              <li key={i}>{e.line ? `Ligne ${e.line} : ` : ""}{e.message}</li>
            ))}
          </ul>
        </Alert>
      )}
    </form>
  );
}
