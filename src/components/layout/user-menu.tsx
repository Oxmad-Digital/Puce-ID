"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe, LogOut, Settings, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui";
import { pick, T, useLang, type Bi } from "./lang-toggle";

export function UserMenu({
  name,
  subtitle,
  tone,
}: {
  name: string;
  subtitle: string | Bi;
  tone: "brand" | "accent";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lang = useLang();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  async function signOut() {
    await authClient.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-brand-50"
      >
        <Avatar name={name} size="sm" tone={tone} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs font-semibold text-ink">{name}</span>
          <span className="block text-[10px] text-muted">{pick(subtitle, lang)}</span>
        </span>
        <ChevronDown className="size-3.5 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-xl">
          <Link href="/parametres" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface">
            <User className="size-4 text-muted" /> <T fr="Mon profil" mg="Ny mombamomba ahy" />
          </Link>
          <Link href="/parametres#securite" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface">
            <Settings className="size-4 text-muted" /> <T fr="Paramètres" mg="Fikirana" />
          </Link>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface">
            <Globe className="size-4 text-muted" /> <T fr="Retour au site" mg="Hiverina amin'ny tranonkala" />
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" /> <T fr="Déconnexion" mg="Hivoaka" />
          </button>
        </div>
      )}
    </div>
  );
}
