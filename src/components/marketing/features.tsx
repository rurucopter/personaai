"use client";

import { motion } from "framer-motion";
import { Clock, Mic, Palette, Play, Sparkles, Wand2 } from "lucide-react";

const BENTO = [
  {
    icon: Sparkles,
    title: "Qualité Pixar",
    description:
      "Personnages 3D ultra-détaillés, textures cinématiques et éclairage studio — le rendu des plus grands studios d'animation.",
    span: "sm:col-span-2 sm:row-span-2",
    accent: true,
    visual: (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/pixar-hero.jpg"
          alt="Exemple Pixar"
          className="aspect-square rounded-xl object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/pixar-hero-2.jpg"
          alt="Exemple Pixar 2"
          className="aspect-square rounded-xl object-cover"
        />
      </div>
    ),
  },
  {
    icon: Mic,
    title: "Voix off française",
    description:
      "Voix générée en français, synchronisée avec votre scénario. Vos personnages parlent vraiment.",
    span: "",
    accent: false,
    visual: null,
  },
  {
    icon: Clock,
    title: "Prêt en 3 minutes",
    description:
      "Pas de logiciel à installer. Écrivez, cliquez, récupérez. Aussi simple qu'un post Instagram.",
    span: "",
    accent: false,
    visual: null,
  },
  {
    icon: Palette,
    title: "Styles viraux",
    description:
      "Fruits qui parlent, personnages Pixar — des formats conçus pour capter l'attention sur TikTok et Reels.",
    span: "",
    accent: false,
    visual: (
      <div className="mt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero-fruit.jpg"
          alt="Fruits style"
          className="aspect-video w-full rounded-xl object-cover"
        />
      </div>
    ),
  },
  {
    icon: Wand2,
    title: "Zéro compétence requise",
    description:
      "Pas besoin de savoir monter, animer ou scripter. Vous écrivez une histoire, l'IA fait le reste.",
    span: "",
    accent: false,
    visual: null,
  },
  {
    icon: Play,
    title: "Multi-plateforme",
    description:
      "Format vertical 9:16, optimisé pour TikTok, Reels, YouTube Shorts. Publiez immédiatement.",
    span: "",
    accent: false,
    visual: null,
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 flex flex-col items-center gap-3 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-medium tracking-widest text-brand uppercase"
        >
          Fonctionnalités
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Tout ce qu&apos;il faut pour créer
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-lg text-muted-foreground"
        >
          La technologie IA la plus avancée, accessible en quelques clics.
        </motion.p>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3">
        {BENTO.map(({ icon: Icon, title, description, span, accent, visual }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-colors ${span} ${
              accent
                ? "border-brand/30 bg-gradient-to-br from-brand/10 via-transparent to-brand-2/5 shadow-[0_0_60px_-20px_color-mix(in_oklch,var(--brand),transparent_60%)]"
                : "border-border bg-card hover:border-brand/30"
            }`}
          >
            <div
              className={`mb-3 flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                accent
                  ? "bg-gradient-to-br from-brand to-brand-2 text-white shadow-[0_8px_24px_-8px_var(--brand)]"
                  : "bg-muted text-brand"
              }`}
            >
              <Icon className="size-5" />
            </div>
            <h3 className={`font-semibold ${accent ? "text-lg" : ""}`}>
              {title}
            </h3>
            <p
              className={`mt-1 text-sm leading-relaxed text-muted-foreground ${
                accent ? "max-w-sm" : ""
              }`}
            >
              {description}
            </p>
            {visual}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
