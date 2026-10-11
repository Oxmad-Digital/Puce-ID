import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Redirection rapide vers /connexion si aucun cookie de session n'est présent.
 * La vérification réelle (validité, rôle) est faite côté serveur dans lib/session.ts.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/espace",
    "/tableau-de-bord",
    "/mes-animaux",
    "/animaux/:path*",
    "/transferts",
    "/signalements",
    "/notifications",
    "/parametres",
    "/veterinaire/:path*",
    "/admin/:path*",
  ],
};
