# PawSafe — Registre des animaux à puce (Puce-ID)

Registre en ligne des animaux identifiés par puce électronique à Madagascar : recherche publique d'une puce, contact anonyme du propriétaire, espaces propriétaire / vétérinaire / administrateur.

Maquettes de référence : [`docs/maquettes/`](docs/maquettes/).

## Stack

| Rôle | Outil |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack) |
| UI | Tailwind CSS v4, lucide-react |
| Base de données | Neon Postgres + Drizzle ORM (`drizzle-orm/neon-http` côté app) |
| Authentification | Better Auth (e-mail + mot de passe, Google optionnel) |
| Fichiers (photos, documents) | Cloudflare R2 via l'API S3 (URLs signées) |
| Hébergement | Vercel |

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis compléter les valeurs
npm run db:migrate           # applique les migrations ./drizzle
npm run db:seed              # données de démo (facultatif)
npm run dev
```

Comptes de démo créés par `db:seed` (mot de passe `pawsafe2026`) :

| Rôle | E-mail |
| --- | --- |
| Administrateur | admin@pawsafe.mg |
| Vétérinaire vérifié | dr.rakoto@pawsafe.mg |
| Vétérinaire en attente | dr.razafy@pawsafe.mg |
| Propriétaire | rasoa@example.mg |

> **Réseau local :** les scripts `dev` / `start` passent `--network-family-autoselection-attempt-timeout=1000` à Node. Sans cette option, le `fetch` de Node peut échouer vers Neon sur les réseaux où l'IPv6 est injoignable. Vercel n'est pas concerné.

## Scripts

| Script | Effet |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm run db:generate` | Génère une migration SQL après modification de `src/lib/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations (connexion WebSocket Neon) |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Données de démonstration (ignoré si des utilisateurs existent) |
| `npm run r2:cors -- <origine>` | Configure le CORS du bucket (nécessite un jeton R2 « Admin ») |

## Variables d'environnement

Voir [`.env.example`](.env.example). À reporter dans **Vercel → Settings → Environment Variables** :
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (URL de production), `NEXT_PUBLIC_APP_URL`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, et en option `R2_PUBLIC_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Cloudflare R2

Les photos et documents sont envoyés directement du navigateur vers R2 via une URL signée (`POST /api/upload`), puis servis par `GET /api/files/<clé>` (redirection signée ; les documents sont réservés aux personnes ayant accès à la fiche).

Le bucket doit autoriser ces origines dans **R2 → puce-id → Settings → CORS policy** :

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://<domaine-vercel>"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

## Rôles et pages

**Public** : `/` (vérifier une puce), `/puce/[numero]/contact` (contact anonyme), `/puce/[numero]/contester`, `/veterinaires`, `/perdu-trouve`, `/faq`, `/guide-identification`, `/contact`, `/mentions-legales`, `/confidentialite`, `/cgu`.

**Authentification** : `/connexion`, `/inscription` (propriétaire ou vétérinaire), `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`.

**Propriétaire** : `/tableau-de-bord`, `/mes-animaux`, `/animaux/nouveau`, `/animaux/[id]` (+ `/modifier`), `/transferts`, `/signalements`, `/notifications`, `/parametres`.

**Vétérinaire** : `/veterinaire`, `/veterinaire/patients`, `/veterinaire/scanner`, `/veterinaire/import` (CSV, modèle dans `public/modeles/`), `/veterinaire/journal`, plus les pages partagées.

**Administrateur** : `/admin` (validation des vétérinaires, doublons et contestations), `/admin/veterinaires`, `/admin/journal`.

Règles métier principales :
- les coordonnées des propriétaires ne sont jamais publiques ; seuls le propriétaire et les vétérinaires **vérifiés** y ont accès, et chaque consultation par un vétérinaire est inscrite dans le journal d'accès ;
- un numéro de puce est unique (15 chiffres) ; une tentative de doublon crée un signalement pour l'administration ;
- un transfert de propriété n'est effectif qu'après acceptation du destinataire ;
- à l'inscription, les animaux et transferts saisis avec l'e-mail de la personne lui sont automatiquement rattachés.

## Reste à faire

- **E-mails** : `src/lib/mail.ts` se contente de journaliser. Brancher un fournisseur (Resend, Brevo…) pour la réinitialisation de mot de passe, les messages anonymes et les transferts.
- **Traductions malgache** : le sélecteur FR / MG enregistre la préférence (cookie `lang`), mais les textes MG restent à fournir.
- **Google OAuth** : renseigner `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (URI de redirection : `<URL>/api/auth/callback/google`).
- **CORS R2** : voir plus haut.
- Textes légaux : compléter les champs `[à compléter]` des mentions légales.
