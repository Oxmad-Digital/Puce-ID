import { Prose } from "@/components/prose";
import { ByLang } from "@/components/layout/lang-toggle";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function TermsPage() {
  return (
    <Prose>
      <ByLang
        fr={
          <>
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
          </>
        }
        mg={
          <>
            <h1 className="text-2xl font-bold text-ink">Fepetra ankapobeny momba ny fampiasana</h1>
            <p>Fanavaozana farany : oktobra 2026.</p>
            <h2>1. Tanjona</h2>
            <p>Ny Puce ID dia rejisitra an-tserasera misy ireo biby voamarika amin&apos;ny puce elektronika eto Madagasikara. Ireto fepetra ireto no mifehy ny fampiasan&apos;ny mpitsidika, ny tompon&apos;biby ary ny dokotera mpitsabo biby ny tranonkala.</p>
            <h2>2. Kaonty</h2>
            <p>Manaiky ny hanome fampahalalana marina sy hanavao azy tsy tapaka ny mpampiasa. Tsy mandeha ny kaonty dokotera raha tsy efa voamarina ny laharana ao amin&apos;ny Holafitra (Ordre).</p>
            <h2>3. Adidin&apos;ny dokotera mpitsabo biby</h2>
            <p>Tsy mijery ny fifandraisana amin&apos;ny tompon&apos;biby ny dokotera afa-tsy mba hamantarana biby iray. Mety hampiato ny kaonty ny fijerena tsy ara-dalàna.</p>
            <h2>4. Filazana</h2>
            <p>Tsy maintsy momba biby tena misy ny filazana Very / Hita. Afaka manala izay filazana sandoka na manompa ny Puce ID.</p>
            <h2>5. Famindrana fananana</h2>
            <p>Tsy manan-kery ny famindrana raha tsy efa neken&apos;ny tompony vaovao. Voatahiry ny tantaran&apos;ny fananana.</p>
            <h2>6. Andraikitra</h2>
            <p>Fitaovana hampifandraisana ihany no omen&apos;ny Puce ID, ka tsy tompon&apos;andraikitra amin&apos;ny fahaverezan&apos;ny biby na amin&apos;ny fifanakalozana eo amin&apos;ny mpampiasa izy.</p>
          </>
        }
      />
    </Prose>
  );
}
