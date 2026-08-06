import {
  Briefcase,
  Clapperboard,
  GraduationCap,
  Megaphone,
  Sparkles,
  Video,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const USE_CASES = [
  {
    icon: Video,
    title: "Créateurs de contenu",
    description: "Sortez du lot avec des formats visuels uniques pour vos réseaux.",
    hue: 305,
  },
  {
    icon: Briefcase,
    title: "Entrepreneurs & dirigeants",
    description: "Une image professionnelle et mémorable pour vos communications.",
    hue: 260,
  },
  {
    icon: GraduationCap,
    title: "Coachs & formateurs",
    description: "Une présence charismatique pour vos contenus pédagogiques.",
    hue: 200,
  },
  {
    icon: Clapperboard,
    title: "Streamers & gamers",
    description: "Des identités visuelles fun pour vos vignettes et intros.",
    hue: 335,
  },
  {
    icon: Sparkles,
    title: "Acteurs & artistes",
    description: "Testez des looks et univers pour vos showreels.",
    hue: 280,
  },
  {
    icon: Megaphone,
    title: "Équipes marketing",
    description: "Produisez du contenu vidéo original à grande échelle.",
    hue: 320,
  },
];

export function UseCases() {
  return (
    <section id="cas-usage" className="border-t border-white/10 bg-white/[0.015]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium tracking-widest text-brand uppercase">
            Pour qui
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Cas d&apos;utilisation
          </h2>
          <p className="text-muted-foreground">
            PersonaAI s&apos;adapte à vos besoins créatifs.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((useCase, i) => (
            <Reveal
              key={useCase.title}
              delay={i * 0.06}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full blur-2xl transition-opacity group-hover:opacity-80"
                style={{
                  backgroundColor: `oklch(0.6 0.24 ${useCase.hue} / 35%)`,
                }}
              />
              <div
                className="relative mb-4 flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `oklch(0.6 0.24 ${useCase.hue} / 18%)` }}
              >
                <useCase.icon
                  className="size-5"
                  style={{ color: `oklch(0.72 0.2 ${useCase.hue})` }}
                />
              </div>
              <h3 className="relative mb-2 font-medium">{useCase.title}</h3>
              <p className="relative text-sm text-muted-foreground">{useCase.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
