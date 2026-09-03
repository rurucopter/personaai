import { ArrowRight, User } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { getAvatarTemplateById } from "@/lib/avatar-templates";

const EXAMPLES = [
  { label: "🎬 Style 3D Pixar", imageUrl: "/marketing/pixar-hero-2.jpg" },
  { label: "🍌 Fruits qui parlent", imageUrl: getAvatarTemplateById("talking-banana")?.imageUrl },
];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium tracking-widest text-brand uppercase">
          La transformation
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Avant / après
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Un aperçu de la transformation — votre résultat final dépendra de
          votre vidéo.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {EXAMPLES.map((example, i) => (
          <Reveal
            key={example.label}
            delay={i * 0.1}
            className="group flex items-center gap-2 overflow-hidden rounded-2xl border border-border"
          >
            <div className="flex aspect-[3/4] flex-1 flex-col items-center justify-center gap-2 bg-muted/40 text-sm text-muted-foreground">
              <User className="size-6" />
              Vous
            </div>
            <ArrowRight className="mx-1 size-4 shrink-0 text-brand" />
            <div className="relative aspect-[3/4] flex-1 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={example.imageUrl}
                alt={example.label}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="text-sm font-medium text-white">{example.label}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
