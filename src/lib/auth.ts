import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/lib/db";
import { sendMail } from "@/lib/mail";

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

export const auth = betterAuth({
  appName: "Puce ID",
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // neon-http ne gère pas les transactions interactives
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    async sendResetPassword({ user, url }) {
      await sendMail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe Puce ID",
        text: `Bonjour ${user.name},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien : ${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
      });
    },
  },
  socialProviders: google,
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "owner", input: false },
      phone: { type: "string", required: false },
      city: { type: "string", required: false },
      locale: { type: "string", required: false, defaultValue: "fr", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
