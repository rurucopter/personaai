"use client";

import { motion } from "framer-motion";
import { getAvatarTemplateById } from "@/lib/avatar-templates";

const fruit = getAvatarTemplateById("talking-banana");

export function StyleShowcase() {
  return (
    <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center gap-6 px-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        className="relative w-1/2 max-w-xs overflow-hidden rounded-2xl border border-border shadow-[0_30px_90px_-20px_color-mix(in_oklch,var(--brand),transparent_35%)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/pixar-hero.jpg"
          alt="Style 3D Pixar"
          className="aspect-[3/4] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="text-sm font-semibold text-white">🎬 Style 3D Pixar</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: 6 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        className="relative w-1/2 max-w-xs overflow-hidden rounded-2xl border border-border shadow-[0_30px_90px_-20px_color-mix(in_oklch,var(--brand-2),transparent_35%)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fruit?.imageUrl}
          alt="Fruits qui parlent"
          className="aspect-[3/4] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="text-sm font-semibold text-white">🍌 Fruits qui parlent</span>
        </div>
      </motion.div>
    </div>
  );
}
