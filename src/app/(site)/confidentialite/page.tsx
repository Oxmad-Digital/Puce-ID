import { Prose } from "@/components/prose";
import { ByLang } from "@/components/layout/lang-toggle";

export const metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <Prose>
      <ByLang
        fr={
          <>
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
          </>
        }
        mg={
          <>
            <h1 className="text-2xl font-bold text-ink">Politika momba ny tsiambaratelo</h1>
            <p>Fanavaozana farany : oktobra 2026. Ity politika ity dia mifanaraka amin&apos;ny lalàna laharana faha-2014-038 momba ny fiarovana ny angona manokana eto Madagasikara.</p>
            <h2>Angona angonina</h2>
            <ul>
              <li>Tompon&apos;biby : anarana, telefaonina, mailaka, tanàna, fampahalalana momba ny biby.</li>
              <li>Dokotera mpitsabo biby : mombamomba, toeram-pitsaboana, laharana ao amin&apos;ny Holafitra (Ordre), fifandraisana ara-asa.</li>
              <li>Mpitsidika : laharan&apos;ny puce notadiavina, hafatra nalefa tamin&apos;ny taratasy tsy misy anarana.</li>
            </ul>
            <h2>Tanjona</h2>
            <p>Ampiasaina ihany ny angona mba hamantarana ny biby, hahitana ny tompony ary hanaraha-maso ny fiovan&apos;ny tompony.</p>
            <h2>Iza no mahita ny fifandraisana aminao ?</h2>
            <p>Tsy ny besinimaro mihitsy. Ny dokotera voamarina ny laharany ao amin&apos;ny Holafitra ihany no afaka mijery izany, ary voasoratra miaraka amin&apos;ny daty sy ora ao amin&apos;ny diarin&apos;ny fidirana ny fijerena tsirairay.</p>
            <h2>Faharetan&apos;ny fitahirizana</h2>
            <p>Tehirizina mandritra ny fiainan&apos;ny biby ny fiche, ary 5 taona aorian&apos;ny fanambarana ny fahafatesany. Tehirizina 3 taona ny diarin&apos;ny fidirana.</p>
            <h2>Ny zonao</h2>
            <p>Afaka mijery, manitsy na mangataka ny hamafana ny angonao ianao ao amin&apos;ny fikiranao na amin&apos;ny fanoratana any amin&apos;ny contact@puceid.mg.</p>
          </>
        }
      />
    </Prose>
  );
}
