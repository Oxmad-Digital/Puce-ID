# Puce ID — Registre des animaux à puce

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
| E-mails transactionnels | Resend (API HTTP, sans dépendance) |
| Hébergement | Vercel |

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis compléter les valeurs
npm run db:migrate           # applique les migrations ./drizzle
npm run db:seed              # données de démo (facultatif)
npm run dev
```

Comptes de démo créés par `db:seed` (mot de passe `puceid2026`) :

| Rôle | E-mail |
| --- | --- |
| Administrateur | admin@puceid.mg |
| Vétérinaire vérifié | dr.rakoto@puceid.mg |
| Vétérinaire en attente | dr.razafy@puceid.mg |
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
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (URL de production), `NEXT_PUBLIC_APP_URL`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `CONTACT_EMAIL`, et en option `R2_PUBLIC_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

Sans `RESEND_API_KEY`, les e-mails sont affichés dans la console du serveur (pratique en local). En production, le domaine de `MAIL_FROM` doit être vérifié dans Resend.

## Cloudflare R2

Les visuels du site (accueil et authentification) sont servis en WebP depuis R2 via la route de fichiers existante. Le manifeste `src/lib/site-images.json` contient les clés autorisées pour ces images publiques ; le bucket reste privé si `R2_PUBLIC_URL` n’est pas configuré. Les composants `Image` utilisent `unoptimized` pour laisser le navigateur suivre la redirection signée vers ces fichiers déjà compressés (l’optimiseur Next.js ne suit pas les redirections des routes internes).

`npm run r2:images` convertit les sources PNG/JPEG de `public/images/` en WebP (qualité 82), vérifie leur présence dans R2 et envoie uniquement les fichiers manquants. Les clés incluent une empreinte du contenu et les objets utilisent un cache d’un an. Le manifeste est mis à jour après vérification de tous les fichiers. Les sources sont conservées pour permettre une nouvelle compression.

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

**Authentification** : `/connexion`, `/inscription` (propriétaire ou vétérinaire), `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `/nouveau-mot-de-passe` (première connexion d'un compte invité).

**Propriétaire** : `/tableau-de-bord`, `/mes-animaux`, `/animaux/nouveau`, `/animaux/[id]` (+ `/modifier`), `/transferts`, `/signalements`, `/notifications`, `/parametres`.

**Vétérinaire** : `/veterinaire`, `/veterinaire/patients`, `/veterinaire/scanner`, `/veterinaire/import` (CSV, modèle dans `public/modeles/`), `/veterinaire/journal`, `/veterinaire/clinique` (informations et équipe de la clinique), plus les pages partagées.

**Administrateur** : `/admin` (validation des vétérinaires, doublons et contestations), `/admin/veterinaires` (cliniques, équipes, invitations), `/mes-animaux` (registre complet avec filtre par clinique), `/admin/journal`.

Règles métier principales :
- les coordonnées des propriétaires ne sont jamais publiques ; seuls le propriétaire et les vétérinaires **vérifiés** y ont accès, et chaque consultation par un vétérinaire est inscrite dans le journal d'accès ;
- un numéro de puce est unique (15 chiffres) ; une tentative de doublon crée un signalement pour l'administration ;
- un transfert de propriété n'est effectif qu'après acceptation du destinataire ;
- à l'inscription, les animaux et transferts saisis avec l'e-mail de la personne lui sont automatiquement rattachés.

### Cliniques et droits

- Chaque vétérinaire appartient à une **clinique** (`clinic`), avec le rôle **responsable** ou **membre**. Un vétérinaire qui s'inscrit seul crée sa clinique et en devient responsable.
- Les vétérinaires vérifiés d'une clinique partagent ses patients : chaque animal a une **clinique responsable** (`animal.clinic_id`), renseignée automatiquement lors de l'enregistrement ou de l'import CSV.
- Le responsable modifie les informations de la clinique, invite des confrères et nomme d'autres responsables. Un confrère invité par sa clinique garde un numéro d'ordre « en attente » jusqu'à sa vérification par l'administration.
- **Changement de clinique** : le propriétaire, la clinique actuelle ou l'administration propose une nouvelle clinique depuis la fiche animal ; la clinique d'accueil est prévenue par e-mail et accepte ou refuse depuis `/transferts` (14 jours). Un changement fait par l'administration ou par la clinique d'accueil elle-même est immédiat.

### Invitations et mots de passe provisoires

Un compte est créé avec un **mot de passe provisoire** (format `Xk7p-9QaR-m4Tz`) envoyé par e-mail quand :
- l'administration invite une clinique et son vétérinaire responsable (compte directement vérifié) ;
- un responsable de clinique, ou l'administration, invite un confrère ;
- un vétérinaire enregistre ou importe un animal dont le propriétaire n'a pas encore de compte ;
- un transfert de propriété est proposé à une personne sans compte.

À la première connexion, `requireUser()` redirige vers `/nouveau-mot-de-passe` tant que `user.must_change_password` est vrai. Les invitations non activées peuvent être renvoyées (nouveau mot de passe provisoire) depuis `/veterinaire/clinique` ou `/admin/veterinaires`.

## Reste à faire

- **E-mails** : créer le compte Resend, vérifier le domaine d'envoi et renseigner `RESEND_API_KEY` / `MAIL_FROM` (local et Vercel).
- **Traductions malgache** : le sélecteur FR / MG enregistre la préférence (cookie `lang`), mais les textes MG restent à fournir.
- **Google OAuth** : renseigner `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (URI de redirection : `<URL>/api/auth/callback/google`).
- **CORS R2** : voir plus haut.
- Textes légaux : compléter les champs `[à compléter]` des mentions légales.
