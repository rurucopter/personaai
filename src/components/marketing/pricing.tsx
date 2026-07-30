import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "9€",
    period: "/mois",
    description: "Pour découvrir PersonaAI.",
    features: ["20 crédits par mois", "Qualité standard", "Tous les personas"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les créateurs réguliers.",
    features: [
      "80 crédits par mois",
      "Qualité haute",
      "Tous les personas",
      "Génération prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    price: "79€",
    period: "/mois",
    description: "Pour les équipes et agences.",
    features: [
      "250 crédits par mois",
      "Qualité ultra",
      "Tous les personas",
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
    <section id="tarifs" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Tarifs</h2>
        <p className="text-muted-foreground">
          Commencez gratuitement avec 3 crédits offerts, évoluez à votre rythme.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col gap-6 rounded-xl border p-6",
              plan.highlighted ? "border-primary" : "border-border"
            )}
          >
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
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
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
          </div>
        ))}
      </div>
    </section>
  );
}
