import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function ReferralPromo() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <Reveal className="flex flex-col items-center gap-5 rounded-2xl border border-brand/30 bg-gradient-to-b from-brand/10 to-transparent px-6 py-12 text-center sm:px-12">
        <div className="flex size-12 items-center justify-center rounded-full bg-brand/15">
          <Gift className="size-6 text-brand" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Parrainez vos amis, gagnez des crédits
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Chaque ami qui s&apos;abonne grâce à votre lien vous rapporte{" "}
          <span className="font-medium text-foreground">3 crédits offerts</span>{" "}
          — de quoi générer une vidéo de plus, gratuitement.
        </p>
        <Button size="lg" render={<Link href="/signup" />} nativeButton={false}>
          Créer mon compte et obtenir mon lien
        </Button>
      </Reveal>
    </section>
  );
}
