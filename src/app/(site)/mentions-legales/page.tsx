import { Prose } from "@/components/prose";
import { ByLang } from "@/components/layout/lang-toggle";

export const metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <Prose>
      <ByLang
        fr={
          <>
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
          </>
        }
        mg={
          <>
            <h1 className="text-2xl font-bold text-ink">Fampahalalana ara-dalàna</h1>
            <p>Fanavaozana farany : oktobra 2026.</p>
            <h2>Mpamoaka ny tranonkala</h2>
            <p>Puce ID — [anarana ara-dalàna, endrika ara-dalàna ary renivola mbola hofenoina]<br />Foibe : Antananarivo, Madagasikara<br />NIF / STAT : [mbola hofenoina]<br />Talen&apos;ny famoahana : [mbola hofenoina]<br />Fifandraisana : contact@puceid.mg</p>
            <h2>Fampiantranoana</h2>
            <p>Rindranasa : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Etazonia.<br />Banky angona : Neon (faritra Eoropa — Frankfurt).<br />Rakitra : Cloudflare R2.</p>
            <h2>Fananana ara-tsaina</h2>
            <p>An&apos;ny Puce ID avokoa ny votoatin&apos;ny tranonkala (lahatsoratra, sary famantarana, endrika), raha tsy misy filazana hafa. Voarara ny fandikana tsy nahazoana alalana.</p>
            <h2>Andraikitra</h2>
            <p>Ny dokotera sy ny tompon&apos;biby no mampiditra ny fampahalalana ao amin&apos;ny rejisitra. Manao izay fara heriny ny Puce ID mba hahamarina izany, saingy tsy tompon&apos;andraikitra amin&apos;ny fampahalalana diso voalaza tara izy.</p>
          </>
        }
      />
    </Prose>
  );
}
