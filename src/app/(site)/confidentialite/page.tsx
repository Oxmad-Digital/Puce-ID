import { Prose } from "@/components/prose";

export const metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-bold text-ink">Politique de confidentialité</h1>
      <p>Dernière mise à jour : octobre 2026. Cette politique s&apos;inscrit dans le cadre de la loi n° 2014-038 sur la protection des données à caractère personnel à Madagascar.</p>
      <h2>Données collectées</h2>
      <ul>
        <li>Propriétaires : nom, téléphone, e-mail, ville, informations sur les animaux.</li>
        <li>Vétérinaires : identité, clinique, numéro d&apos;ordre, coordonnées professionnelles.</li>
        <li>Visiteurs : numéros de puce recherchés, messages envoyés via le formulaire anonyme.</li>
      </ul>
      <h2>Finalités</h2>
      <p>Les données servent exclusivement à identifier les animaux, à permettre de retrouver leur propriétaire et à tracer les changements de propriété.</p>
      <h2>Qui voit vos coordonnées ?</h2>
      <p>Jamais le public. Seuls les vétérinaires dont le numéro d&apos;ordre a été vérifié peuvent les consulter, et chaque consultation est enregistrée dans un journal d&apos;accès horodaté.</p>
      <h2>Durée de conservation</h2>
      <p>Les fiches sont conservées pendant la vie de l&apos;animal puis 5 ans après la déclaration de décès. Les journaux d&apos;accès sont conservés 3 ans.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez accéder à vos données, les rectifier ou demander leur suppression depuis vos paramètres ou en écrivant à contact@puceid.mg.</p>
    </Prose>
  );
}
