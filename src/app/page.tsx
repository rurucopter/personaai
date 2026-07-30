export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
        PersonaAI
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Fondations posées.
      </h1>
      <p className="max-w-md text-muted-foreground">
        Landing page, auth et dashboard arrivent dans les prochaines phases.
      </p>
    </div>
  );
}
