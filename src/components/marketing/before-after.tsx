import { ArrowRight } from "lucide-react";

const EXAMPLES = [
  {
    persona: "CEO",
    gradient: "from-zinc-700 to-zinc-900",
  },
  {
    persona: "Cyberpunk",
    gradient: "from-fuchsia-600 to-indigo-700",
  },
  {
    persona: "Viking",
    gradient: "from-stone-600 to-stone-900",
  },
];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Avant / après
        </h2>
        <p className="text-muted-foreground">
          Un aperçu de la transformation — votre résultat final dépendra de
          votre vidéo et de vos réglages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {EXAMPLES.map((example) => (
          <div key={example.persona} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-border">
              <div className="flex aspect-[3/4] flex-1 items-center justify-center bg-muted text-sm text-muted-foreground">
                Vous
              </div>
              <ArrowRight className="mx-2 size-4 shrink-0 text-muted-foreground" />
              <div
                className={`flex aspect-[3/4] flex-1 items-center justify-center bg-gradient-to-br text-sm font-medium text-white ${example.gradient}`}
              >
                {example.persona}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
