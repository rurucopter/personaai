import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,color-mix(in_oklch,var(--brand),transparent_80%),transparent)]"
      />

      <Reveal className="mx-auto max-w-4xl px-6 py-28 text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
          Prêt à voir votre{" "}
          <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
            transformation
          </span>{" "}
          ?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          3 crédits offerts à l&apos;inscription, aucune carte requise.
        </p>
        <Button
          size="lg"
          className="mt-8 gap-2 shadow-[0_8px_30px_-8px_var(--brand)]"
          render={<Link href="/signup" />}
          nativeButton={false}
        >
          Créer mon premier persona
          <ArrowRight className="size-4" />
        </Button>
      </Reveal>
    </section>
  );
}
