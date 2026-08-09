import { Reveal } from "@/components/marketing/reveal";

const STEPS = [
  {
    number: "01",
    title: "Importez votre vidéo",
    description: "MP4, MOV ou WEBM. Prévisualisez avant de continuer.",
  },
  {
    number: "02",
    title: "Choisissez un persona",
    description: "CEO, Viking, Cyberpunk, Anime... plus de 15 univers.",
  },
  {
    number: "03",
    title: "Personnalisez",
    description: "Tenue, coiffure, lumière, énergie, caméra, qualité.",
  },
  {
    number: "04",
    title: "Générez",
    description: "Suivez la progression en direct, recevez votre vidéo.",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium tracking-widest text-brand uppercase">
            Le processus
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="text-muted-foreground">
            Quatre étapes, quelques minutes, un résultat bluffant.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.08} className="relative flex flex-col gap-2">
              <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-3xl font-black text-transparent">
                {step.number}
              </span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-4 -right-4 hidden h-px w-8 bg-gradient-to-r from-white/20 to-transparent lg:block"
                />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
