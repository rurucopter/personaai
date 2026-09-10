"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const TESTIMONIALS = [
  {
    name: "Léa M.",
    role: "Créatrice TikTok · 280K abonnés",
    avatar: "LM",
    content:
      "J'ai posté ma première vidéo PersonaAI un dimanche soir. Le lundi, elle avait 400K vues. Mon meilleur ratio engagement/effort depuis que je crée.",
    stars: 5,
    highlight: "400K vues en 24h",
  },
  {
    name: "Karim B.",
    role: "Coach business · YouTube",
    avatar: "KB",
    content:
      "Mes clients adorent recevoir un résumé vidéo 3D de leur session. Ça a complètement changé ma rétention — les gens en parlent à leurs amis.",
    stars: 5,
    highlight: "+40% rétention",
  },
  {
    name: "Sophie D.",
    role: "Freelance marketing digital",
    avatar: "SD",
    content:
      "Je facture la création de vidéos IA à mes clients e-commerce. En 10 minutes je produis ce qui prenait 2 jours. Mon ROI est délirant.",
    stars: 5,
    highlight: "Facturé à ses clients",
  },
  {
    name: "Maxime R.",
    role: "Entrepreneur · SaaS",
    avatar: "MR",
    content:
      "On utilise PersonaAI pour nos démos produit sur les réseaux. Le style Pixar capte l'attention bien mieux qu'un screencast classique.",
    stars: 5,
    highlight: "x3 taux de clic",
  },
  {
    name: "Inès T.",
    role: "Streameuse · Twitch",
    avatar: "IT",
    content:
      "Je transforme mes meilleurs moments de stream en shorts animés. Mes abonnés adorent, et ça m'apporte du trafic cross-plateforme.",
    stars: 5,
    highlight: "+12K abonnés en 2 mois",
  },
  {
    name: "Thomas L.",
    role: "Directeur artistique · Agence",
    avatar: "TL",
    content:
      "La qualité visuelle est bluffante. On a intégré PersonaAI dans notre workflow pour les pitchs clients — c'est devenu un argument de vente.",
    stars: 5,
    highlight: "Intégré en agence",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-muted/20"
      />

      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium tracking-widest text-brand uppercase">
            Témoignages
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ils créent avec PersonaAI
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Créateurs, entrepreneurs, freelances — ils ont intégré la vidéo IA
            dans leur stratégie.
          </p>
        </Reveal>

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="mb-5 break-inside-avoid rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>

              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="size-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {t.content}
              </p>

              <div className="mt-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {t.highlight}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
