export const metadata = { title: "Accès restreint" };

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-32 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Accès restreint</h1>
      <p className="text-muted-foreground">
        PersonaAI est actuellement en usage privé et n&apos;est pas encore
        ouvert aux inscriptions publiques.
      </p>
    </div>
  );
}
