import type { Metadata } from "next";
import { Globe, HeartHandshake, Lock, Mail, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { T } from "@/components/layout/lang-toggle";

export const metadata: Metadata = {
  title: { absolute: "À propos — Puce ID" },
  description:
    "Puce ID relie le numéro de puce d'un animal à son propriétaire, de façon fiable et sécurisée, pour faciliter les retrouvailles à Madagascar.",
};

const audiences = [
  {
    icon: HeartHandshake,
    title: { fr: "Pour les propriétaires", mg: "Ho an'ny tompon'biby" },
    text: {
      fr: "Retrouvez le statut de votre animal et soyez contacté si quelqu'un le trouve, sans que vos coordonnées soient exposées.",
      mg: "Jereo ny toetry ny bibinao, ary azo ifandraisana aminao raha misy mahita azy, nefa tsy aseho ampahibemaso ny mombamomba anao.",
    },
  },
  {
    icon: Stethoscope,
    title: { fr: "Pour les vétérinaires", mg: "Ho an'ny dokotera mpitsabo biby" },
    text: {
      fr: "Enregistrez les animaux suivis par votre cabinet et transférez un dossier à un autre cabinet, après validation par l'administration de Puce ID.",
      mg: "Soraty ao amin'ny rejisitra ireo biby arahin'ny toeram-pitsaboanao, ary afindrao any amin'ny toeram-pitsaboana hafa ny antontan-taratasin'ny biby iray, rehefa nankatoavin'ny mpitantana ny Puce ID.",
    },
  },
  {
    icon: Search,
    title: { fr: "Pour tous", mg: "Ho an'ny rehetra" },
    text: {
      fr: "Saisissez les 15 chiffres d'une puce pour vérifier le statut d'un animal trouvé et prévenir son propriétaire.",
      mg: "Ampidiro ireo isa 15 amin'ny puce iray mba hamantarana ny toetry ny biby hitanao sy hampahafantarana ny tompony.",
    },
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Badge tone="brand" className="mb-5">
            <T fr="À propos" mg="Momba anay" />
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.6rem]">
            <T
              fr="Un registre pour que chaque animal retrouve son foyer"
              mg="Rejisitra iray ahafahan'ny biby tsirairay mahita indray ny tokantranony"
            />
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            <T
              fr="Puce ID relie le numéro de puce d'un animal à son propriétaire, de façon fiable et sécurisée, pour faciliter les retrouvailles."
              mg="Ampifandraisin'ny Puce ID amin'ny tompony ny laharan'ny puce an'ny biby iray, amin'ny fomba azo itokisana sy voaaro, mba hanamorana ny fihaonan'izy ireo indray."
            />
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {audiences.map((a) => (
            <Card key={a.title.fr} className="p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <a.icon className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">
                <T {...a.title} />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <T {...a.text} />
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 flex flex-col gap-4 border-brand-100 bg-brand-50 p-6 sm:flex-row sm:items-start">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">
              <T fr="Vos données sont protégées" mg="Voaaro ny mombamomba anao" />
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              <li className="flex gap-2">
                <Lock className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <T
                  fr="Les coordonnées du propriétaire sont saisies par le cabinet vétérinaire et ne sont jamais affichées publiquement."
                  mg="Ny toeram-pitsaboana no mampiditra ny mombamomba ny tompon'ny biby, ary tsy aseho ampahibemaso mihitsy izany."
                />
              </li>
              <li className="flex gap-2">
                <Globe className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <T
                  fr="La recherche publique n'indique que le statut de l'animal."
                  mg="Ny toetry ny biby ihany no asehon'ny fikarohana ho an'ny besinimaro."
                />
              </li>
            </ul>
          </div>
        </Card>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            <Search className="size-4" /> <T fr="Rechercher une puce" mg="Hikaroka puce" />
          </ButtonLink>
          <ButtonLink href="/veterinaires" variant="secondary" size="lg">
            <Stethoscope className="size-4" /> <T fr="Voir les vétérinaires" mg="Hijery ny dokotera mpitsabo biby" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            <Mail className="size-4" /> <T fr="Nous contacter" mg="Mifandraisa aminay" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
