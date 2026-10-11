import "server-only";

/**
 * Envoi d'e-mails transactionnels.
 * TODO : brancher un fournisseur (Resend, Brevo, SES…) quand les identifiants seront disponibles.
 * En attendant, le contenu est journalisé côté serveur.
 */
export async function sendMail(message: { to: string; subject: string; text: string }) {
  console.info(`[mail] → ${message.to} · ${message.subject}\n${message.text}`);
}
