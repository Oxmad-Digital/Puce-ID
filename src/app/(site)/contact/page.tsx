import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/forms/contact-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow={<T fr="Contact" mg="Fifandraisana" />}
        title={<T fr="Une question ? Écrivez-nous" mg="Manana fanontaniana ? Manorata aminay" />}
        description={
          <T
            fr="Notre équipe répond du lundi au vendredi, de 8 h à 17 h (heure de Madagascar)."
            mg="Mamaly ny ekipanay manomboka ny alatsinainy ka hatramin'ny zoma, amin'ny 8 ora maraina ka hatramin'ny 5 ora hariva (ora eto Madagasikara)."
          />
        }
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-3">
          {[
            { icon: Mail, label: { fr: "E-mail", mg: "Mailaka" }, value: "contact@puceid.mg", href: "mailto:contact@puceid.mg" },
            { icon: Phone, label: { fr: "Téléphone", mg: "Telefaonina" }, value: "+261 34 00 000 00", href: "tel:+261340000000" },
            { icon: MapPin, label: { fr: "Adresse", mg: "Adiresy" }, value: "Antananarivo, Madagascar" },
          ].map((c) => (
            <Card key={c.label.fr} className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted">
                  <T {...c.label} />
                </p>
                {c.href ? (
                  <a href={c.href} className="text-sm font-semibold text-ink hover:text-brand-700">{c.value}</a>
                ) : (
                  <p className="text-sm font-semibold text-ink">{c.value}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <ContactForm />
        </Card>
      </div>
    </>
  );
}
