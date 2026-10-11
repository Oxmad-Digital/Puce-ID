import { Prose } from "@/components/prose";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function TermsPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-bold text-ink">Conditions générales d&apos;utilisation</h1>
      <p>Dernière mise à jour : octobre 2026.</p>
      <h2>1. Objet</h2>
      <p>Puce ID est un registre en ligne des animaux identifiés par puce électronique à Madagascar. Les présentes conditions encadrent l&apos;utilisation du site par les visiteurs, propriétaires et vétérinaires.</p>
      <h2>2. Comptes</h2>
      <p>L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les tenir à jour. Les comptes vétérinaires ne sont activés qu&apos;après vérification du numéro d&apos;ordre.</p>
      <h2>3. Obligations des vétérinaires</h2>
      <p>Le vétérinaire ne consulte les coordonnées d&apos;un propriétaire que dans le cadre de l&apos;identification d&apos;un animal. Toute consultation abusive peut entraîner la suspension du compte.</p>
      <h2>4. Signalements</h2>
      <p>Les annonces Perdu / Trouvé doivent concerner un animal réel. Puce ID peut retirer toute annonce frauduleuse ou injurieuse.</p>
      <h2>5. Transferts de propriété</h2>
      <p>Un transfert n&apos;est effectif qu&apos;après acceptation par le nouveau propriétaire. L&apos;historique de propriété est conservé.</p>
      <h2>6. Responsabilité</h2>
      <p>Puce ID met à disposition un outil de mise en relation et ne peut être tenu responsable de la perte d&apos;un animal ni des échanges entre utilisateurs.</p>
    </Prose>
  );
}
