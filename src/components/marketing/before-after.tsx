import { ArrowRight, User } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const EXAMPLES = [
  { persona: "CEO", from: "oklch(0.5 0.03 260)", to: "oklch(0.3 0.02 260)" },
  { persona: "Cyberpunk", from: "oklch(0.66 0.24 335)", to: "oklch(0.5 0.22 300)" },
  { persona: "Viking", from: "oklch(0.55 0.08 60)", to: "oklch(0.35 0.05 50)" },
];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium tracking-widest text-brand uppercase">
          La transformation
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Avant / après
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Un aperçu de la transformation — votre résultat final dépendra de
          votre vidéo et de vos réglages.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {EXAMPLES.map((example, i) => (
          <Reveal
            key={example.persona}
            delay={i * 0.1}
            className="group flex items-center gap-2 overflow-hidden rounded-2xl border border-white/10"
          >
            <div className="flex aspect-[3/4] flex-1 flex-col items-center justify-center gap-2 bg-white/[0.03] text-sm text-muted-foreground">
              <User className="size-6" />
              Vous
            </div>
            <ArrowRight className="mx-1 size-4 shrink-0 text-brand" />
            <div
              className="flex aspect-[3/4] flex-1 items-center justify-center text-sm font-medium text-white transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `linear-gradient(160deg, ${example.from}, ${example.to})` }}
            >
              {example.persona}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
