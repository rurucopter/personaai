import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Prêt à voir votre transformation ?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        3 crédits offerts à l&apos;inscription, aucune carte requise.
      </p>
      <Button
        size="lg"
        className="mt-8 gap-2"
        render={<Link href="/signup" />}
        nativeButton={false}
      >
        Créer mon premier persona
        <ArrowRight className="size-4" />
      </Button>
    </section>
  );
}
