import { Fingerprint, Sparkles, Wand2 } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const FEATURES = [
  {
    icon: Fingerprint,
    title: "Votre identité, préservée",
    description:
      "Chaque transformation s'applique uniquement à votre propre vidéo. Votre visage et votre voix restent reconnaissables.",
  },
  {
    icon: Wand2,
    title: "Contrôle total du style",
    description:
      "Tenue, coiffure, éclairage, énergie, posture : ajustez chaque détail pour un résultat qui vous ressemble.",
  },
  {
    icon: Sparkles,
    title: "Qualité cinéma",
    description:
      "Des modèles vidéo IA de pointe pour un rendu extrêmement réaliste, prêt à être partagé.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }, i) => (
          <Reveal
            key={title}
            delay={i * 0.1}
            className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-brand/40 hover:bg-white/[0.04]"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-[0_8px_24px_-8px_var(--brand)] transition-transform group-hover:scale-110">
              <Icon className="size-5" />
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
