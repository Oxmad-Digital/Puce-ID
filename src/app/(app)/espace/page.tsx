import { redirect } from "next/navigation";
import { homeFor, requireUser } from "@/lib/session";

/** Point d'entrée après connexion : redirige vers l'espace correspondant au rôle. */
export default async function SpacePage() {
  const user = await requireUser();
  redirect(homeFor(user.role));
}
