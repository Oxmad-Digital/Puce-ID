import { Prose } from "@/components/prose";

export const metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-bold text-ink">Mentions légales</h1>
      <p>Dernière mise à jour : octobre 2026.</p>
      <h2>Éditeur du site</h2>
      <p>Puce ID — [raison sociale, forme juridique et capital à compléter]<br />Siège : Antananarivo, Madagascar<br />NIF / STAT : [à compléter]<br />Directeur de la publication : [à compléter]<br />Contact : contact@puceid.mg</p>
      <h2>Hébergement</h2>
      <p>Application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />Base de données : Neon (région Europe — Francfort).<br />Fichiers : Cloudflare R2.</p>
      <h2>Propriété intellectuelle</h2>
      <p>L&apos;ensemble des contenus du site (textes, logos, interface) est la propriété de Puce ID, sauf mention contraire. Toute reproduction sans autorisation est interdite.</p>
      <h2>Responsabilité</h2>
      <p>Les informations du registre sont saisies par les vétérinaires et les propriétaires. Puce ID met tout en œuvre pour en assurer l&apos;exactitude mais ne saurait être tenu responsable d&apos;une information erronée signalée tardivement.</p>
    </Prose>
  );
}
