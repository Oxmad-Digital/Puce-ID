import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Une question ? Écrivez-nous" description="Notre équipe répond du lundi au vendredi, de 8 h à 17 h (heure de Madagascar)." />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-3">
          {[
            { icon: Mail, label: "E-mail", value: "contact@puceid.mg", href: "mailto:contact@puceid.mg" },
            { icon: Phone, label: "Téléphone", value: "+261 34 00 000 00", href: "tel:+261340000000" },
            { icon: MapPin, label: "Adresse", value: "Antananarivo, Madagascar" },
          ].map((c) => (
            <Card key={c.label} className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted">{c.label}</p>
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
