import "server-only";

export type MailMessage = { to: string; subject: string; text: string };

/**
 * Envoi d'e-mails transactionnels via l'API HTTP de Resend.
 * Sans RESEND_API_KEY (développement local), le contenu est journalisé côté serveur.
 * Un échec d'envoi est journalisé mais n'interrompt pas l'action en cours.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
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
      console.error(`[mail] échec ${res.status} → ${message.to} : ${await res.text()}`);
      return false;
    }
  } catch (e) {
    console.error(`[mail] erreur réseau → ${message.to}`, e);
    return false;
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
