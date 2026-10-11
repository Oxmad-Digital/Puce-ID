"use client";

import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Folder = "animals" | "reports" | "documents";

export type UploadedFile = { key: string; fileName: string; contentType: string; size: number };

/** Envoi direct navigateur → R2 via URL signée. */
export async function uploadToR2(file: File, folder: Folder): Promise<UploadedFile> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder, fileName: file.name, contentType: file.type, size: file.size }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Échec de l'envoi");
  const put = await fetch(data.url, { method: "PUT", body: file, headers: { "content-type": file.type } });
  if (!put.ok) throw new Error("Le stockage a refusé le fichier");
  return { key: data.key, fileName: file.name, contentType: file.type, size: file.size };
}

/** Champ photo : envoie l'image dans R2 et stocke la clé dans un input caché `name`. */
export function PhotoUpload({
  name,
  folder,
  defaultKey,
  label = "Ajouter une photo (JPG, PNG, WebP)",
}: {
  name: string;
  folder: Folder;
  defaultKey?: string | null;
  label?: string;
}) {
  const [key, setKey] = useState(defaultKey ?? "");
  const [preview, setPreview] = useState<string | null>(defaultKey ? `/api/files/${defaultKey}` : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    setPreview(URL.createObjectURL(file));
    try {
      const uploaded = await uploadToR2(file, folder);
      setKey(uploaded.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi");
      setPreview(null);
      setKey("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={key} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0])}
      />
      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="h-32 w-32 rounded-lg object-cover ring-1 ring-line" />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
              <Loader2 className="size-5 animate-spin text-brand-600" />
            </div>
          )}
          <button
            type="button"
            aria-label="Retirer la photo"
            onClick={() => {
              setKey("");
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-white text-muted shadow ring-1 ring-line hover:text-red-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-200 bg-brand-50/40 px-4 py-6 text-xs font-medium text-brand-700 hover:bg-brand-50"
        >
          <ImagePlus className="size-4" /> {label}
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Sélecteur de document : envoie le fichier puis appelle `onUploaded`. */
export function DocumentPicker({
  onUploaded,
  className,
}: {
  onUploaded: (file: UploadedFile) => Promise<void> | void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={className}>
      <input
        ref={ref}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            await onUploaded(await uploadToR2(file, "documents"));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Échec de l'envoi");
          } finally {
            setBusy(false);
            if (ref.current) ref.current.value = "";
          }
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline disabled:opacity-60",
        )}
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
        Ajouter un document
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
