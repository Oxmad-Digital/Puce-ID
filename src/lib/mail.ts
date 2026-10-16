import "server-only";

export type MailMessage = { to: string; subject: string; text: string };

const isProduction = process.env.NODE_ENV === "production";

/**
 * Un e-mail peut-il partir ? En développement, sans clé, l'envoi est simulé dans la console.
 * En production, RESEND_API_KEY est obligatoire.
 */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY) || !isProduction;
}

/**
 * Envoi d'e-mails transactionnels via l'API HTTP de Resend.
 * Développement sans RESEND_API_KEY : le contenu complet est journalisé (mots de passe provisoires compris).
 * Production : le contenu, les mots de passe et les jetons ne sont jamais journalisés.
 * Ne lève jamais d'exception : renvoie false si l'e-mail n'est pas parti, à l'appelant de prévenir l'utilisateur.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (isProduction) {
      console.error(`[mail] RESEND_API_KEY absente en production : e-mail non envoyé à ${message.to}.`);
      return false;
    }
    console.info(`[mail] → ${message.to} · ${message.subject}\n${message.text}`);
    return true;
  }

  const body = JSON.stringify({
    from: process.env.MAIL_FROM ?? "Puce ID <no-reply@puceid.mg>",
    reply_to: process.env.CONTACT_EMAIL,
    to: [message.to],
    subject: message.subject,
    text: message.text,
    html: toHtml(message.text),
  });

  try {
    // Resend limite le débit (≈ 2 requêtes/s) : on réessaie après une courte pause en cas de 429.
    for (let attempt = 0; ; attempt++) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body,
      });
      if (res.ok) return true;
      if (res.status === 429 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      // En production, seul le type d'erreur Resend est journalisé (jamais la réponse brute).
      const detail = isProduction ? await resendErrorName(res) : await res.text();
      console.error(`[mail] échec ${res.status} → ${message.to} : ${detail}`);
      return false;
    }
  } catch (e) {
    console.error(`[mail] erreur réseau → ${message.to} : ${e instanceof Error ? e.message : "inconnue"}`);
    return false;
  }
}

async function resendErrorName(res: Response) {
  try {
    const data = (await res.json()) as { name?: unknown };
    return typeof data.name === "string" ? data.name : "erreur inconnue";
  } catch {
    return "réponse illisible";
  }
}

/** Version HTML minimale : texte échappé, liens cliquables, sauts de ligne conservés. */
function toHtml(text: string) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linked = escaped.replace(/https?:\/\/[^\s]+/g, (url) => `<a href="${url}">${url}</a>`);
  return `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#1f2937">${linked.replace(/\n/g, "<br>")}</div>`;
}

export function appUrl(path = "") {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? ""}${path}`;
}
