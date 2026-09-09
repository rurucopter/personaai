"use client";

import { Reveal } from "@/components/marketing/reveal";

interface ShowcaseItem {
  src: string;
  alt: string;
  label: string;
  type: "video" | "image";
}

const ITEMS: ShowcaseItem[] = [
  {
    src: "/marketing/showcase-fruit-1.jpg",
    alt: "Fruits ouvriers sur un chantier",
    label: "🍋 Chantier",
    type: "image",
  },
  {
    src: "/marketing/example-fruit.mp4",
    alt: "Fruits qui parlent",
    label: "🍌 Conversation",
    type: "video",
  },
  {
    src: "/marketing/showcase-fruit-2.jpg",
    alt: "Fruits à la plage",
    label: "🍓 Plage",
    type: "image",
  },
  {
    src: "/marketing/example-pixar.mp4",
    alt: "Style 3D Pixar",
    label: "🎬 Pixar 3D",
    type: "video",
  },
  {
    src: "/marketing/showcase-fruit-3.jpg",
    alt: "Fruits en cuisine",
    label: "🍊 Cuisine",
    type: "image",
  },
  {
    src: "/marketing/showcase-pixar-1.jpg",
    alt: "Personnage 3D Pixar",
    label: "✨ Famille",
    type: "image",
  },
];

export function Showcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Créé par nos utilisateurs
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Fruits qui parlent, style Pixar 3D — choisissez votre univers et
          racontez n&apos;importe quelle histoire.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {ITEMS.map((item, i) => (
          <Reveal
            key={item.src}
            delay={i * 0.08}
            className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-muted"
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <span className="text-sm font-medium text-white">{item.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
