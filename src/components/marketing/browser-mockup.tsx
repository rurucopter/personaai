"use client";

import { motion } from "framer-motion";
import { Sparkles, Upload, Wand2 } from "lucide-react";

const PERSONA_TILES = [
  { label: "CEO", from: "oklch(0.62 0.22 300)", to: "oklch(0.5 0.2 285)" },
  { label: "Cyberpunk", from: "oklch(0.66 0.24 335)", to: "oklch(0.55 0.22 305)" },
  { label: "Viking", from: "oklch(0.6 0.2 270)", to: "oklch(0.48 0.18 300)" },
  { label: "Astronaute", from: "oklch(0.64 0.23 315)", to: "oklch(0.52 0.2 290)" },
];

export function BrowserMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-3xl"
      style={{ perspective: 1200 }}
    >
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,color-mix(in_oklch,var(--brand),transparent_55%),transparent)] blur-2xl"
      />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_40px_120px_-20px_color-mix(in_oklch,var(--brand),transparent_40%)]">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/20 px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            personaai.app/dashboard/create
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-[1fr_1.4fr] sm:p-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-xs text-muted-foreground">
              <Upload className="size-4 shrink-0 text-brand" />
              Votre vidéo importée
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-xs text-muted-foreground">Persona</span>
              <span className="text-sm font-medium">Cyberpunk</span>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: "10%" }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2"
                />
              </div>
              <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-brand">
                <Sparkles className="size-3" />
                Génération en cours
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PERSONA_TILES.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="relative flex aspect-square items-end overflow-hidden rounded-xl p-3"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${tile.from}, ${tile.to})`,
                }}
              >
                <span className="text-xs font-medium text-white/90 drop-shadow">
                  {tile.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-6 py-4 sm:px-8">
          <span className="text-xs text-muted-foreground">
            3 crédits offerts à l&apos;inscription
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Wand2 className="size-3.5" />
            Générer
          </span>
        </div>
      </div>
    </motion.div>
  );
}
