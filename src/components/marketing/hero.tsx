"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserMockup } from "@/components/marketing/browser-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--brand),transparent_82%),transparent)]"
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pt-28 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground"
        >
          <Sparkles className="size-3.5 text-brand" />
          Propulsé par l&apos;IA vidéo générative
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl leading-[1.05] font-black tracking-tight uppercase sm:text-6xl md:text-7xl"
        >
          Importez-vous.
          <br />
          <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
            Transformez-vous.
          </span>
          <br />
          Devenez-le.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl text-lg text-muted-foreground"
        >
          Importez une vidéo de vous-même et transformez votre style, votre
          énergie et votre univers grâce à l&apos;IA — tout en conservant
          votre identité.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="gap-2 shadow-[0_8px_30px_-8px_var(--brand)]"
            render={<Link href="/signup" />}
            nativeButton={false}
          >
            Créer mon premier persona
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<a href="#fonctionnement" />}
            nativeButton={false}
          >
            Voir comment ça marche
          </Button>
        </motion.div>
      </div>

      <div className="px-6 pb-24">
        <BrowserMockup />
      </div>
    </section>
  );
}
