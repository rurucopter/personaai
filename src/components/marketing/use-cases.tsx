const USE_CASES = [
  {
    title: "Créateurs de contenu",
    description: "Sortez du lot avec des formats visuels uniques pour vos réseaux.",
  },
  {
    title: "Entrepreneurs & dirigeants",
    description: "Une image professionnelle et mémorable pour vos communications.",
  },
  {
    title: "Coachs & formateurs",
    description: "Une présence charismatique pour vos contenus pédagogiques.",
  },
  {
    title: "Streamers & gamers",
    description: "Des identités visuelles fun pour vos vignettes et intros.",
  },
  {
    title: "Acteurs & artistes",
    description: "Testez des looks et univers pour vos showreels.",
  },
  {
    title: "Équipes marketing",
    description: "Produisez du contenu vidéo original à grande échelle.",
  },
];

export function UseCases() {
  return (
    <section id="cas-usage" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Cas d&apos;utilisation</h2>
        <p className="text-muted-foreground">
          PersonaAI s&apos;adapte à vos besoins créatifs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <div key={useCase.title} className="rounded-xl border border-border p-6">
            <h3 className="mb-2 font-medium">{useCase.title}</h3>
            <p className="text-sm text-muted-foreground">{useCase.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
