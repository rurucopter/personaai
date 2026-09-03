import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "9,99€",
    period: "/mois",
    description: "Pour découvrir PersonaAI.",
    features: ["8 crédits par mois", "1 crédit = 1 vidéo de 5s", "Tous les styles"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "19,99€",
    period: "/mois",
    description: "Pour les créateurs réguliers.",
    features: [
      "18 crédits par mois",
      "1 crédit = 1 vidéo de 5s",
      "Tous les styles",
      "Génération prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    price: "39,99€",
    period: "/mois",
    description: "Pour les équipes et agences.",
    features: [
      "40 crédits par mois",
      "1 crédit = 1 vidéo de 5s",
      "Tous les styles",
      "Support prioritaire",
    ],
    highlighted: false,
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    period: "",
    description: "Pour un usage à grande échelle.",
    features: ["Volume sur-mesure", "SLA dédié", "Accès API", "Accompagnement dédié"],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium tracking-widest text-brand uppercase">
          Tarifs
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple et transparent</h2>
        <p className="text-muted-foreground">
          Commencez gratuitement avec 3 crédits offerts, évoluez à votre rythme.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => (
          <Reveal
            key={plan.name}
            delay={i * 0.08}
            className={cn(
              "relative flex flex-col gap-6 rounded-2xl border p-6",
              plan.highlighted
                ? "border-brand/50 bg-gradient-to-b from-brand/10 to-transparent shadow-[0_0_40px_-12px_var(--brand)]"
                : "border-border bg-muted/30"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-3 py-1 text-xs font-medium text-white">
                Le plus populaire
              </span>
            )}
            <div>
              <h3 className="font-medium">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="flex flex-1 flex-col gap-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlighted ? "default" : "outline"}
              render={<Link href="/signup" />}
              nativeButton={false}
            >
              Commencer
            </Button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
