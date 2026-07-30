export const metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Conditions d&apos;utilisation
      </h1>
      <p className="mt-4 text-muted-foreground">
        Cette page est un espace réservé. Les conditions d&apos;utilisation
        définitives (identité légale de l&apos;éditeur, juridiction, modalités
        d&apos;abonnement et de résiliation, politique d&apos;usage acceptable)
        doivent être rédigées avant la mise en production.
      </p>
      <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          En résumé, l&apos;utilisation de PersonaAI est réservée à la
          transformation de vidéos dont l&apos;utilisateur est lui-même le
          sujet. Toute utilisation visant à usurper l&apos;identité
          d&apos;un tiers est strictement interdite.
        </p>
      </div>
    </div>
  );
}
