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
    <section id="fonctionnement" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Comment ça marche</h2>
        <p className="text-muted-foreground">
          Quatre étapes, quelques minutes, un résultat bluffant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {step.number}
            </span>
            <h3 className="font-medium">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
