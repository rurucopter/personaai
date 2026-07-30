"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_85%),transparent)]"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground"
        >
          <Sparkles className="size-3.5" />
          Propulsé par l&apos;IA vidéo générative
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Devenez n&apos;importe qui,
          <br />
          en restant vous-même.
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
            className="gap-2"
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
    </section>
  );
}
