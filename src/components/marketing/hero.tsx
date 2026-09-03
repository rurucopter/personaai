"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import { PENDING_CREATION_KEY } from "@/lib/pending-creation";
import { cn } from "@/lib/utils";

const PIXAR_PERSONA_ID = "pixar-3d";
const FRUIT_PERSONA_ID = "template:talking-banana";
const MAX_STORY_LENGTH = 1000;
const EXAMPLE =
  "Une fille rentre chez elle et dit à sa mère : \"Devine quoi, j'ai eu le poste !\" Sa mère la prend dans ses bras, folle de joie.";

const fruitTemplate = getAvatarTemplateById("talking-banana");

export function Hero() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerate() {
    if (!story.trim() || !personaId) return;
    setSubmitting(true);

    try {
      sessionStorage.setItem(
        PENDING_CREATION_KEY,
        JSON.stringify({ story, personaId, durationSeconds: 5 })
      );

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      router.push(user ? "/dashboard/create" : "/signup");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--brand),transparent_82%),transparent)]"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
        >
          <Sparkles className="size-3.5 text-brand" />
          Propulsé par l&apos;IA vidéo générative
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl leading-[1.05] font-black tracking-tight uppercase sm:text-6xl"
        >
          Une histoire.
          <br />
          <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
            Un style.
          </span>
          <br />
          Une vidéo.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-md text-lg text-muted-foreground"
        >
          Écrivez votre histoire, choisissez un style, et laissez l&apos;IA
          générer la vidéo entière.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 w-full rounded-2xl border border-border bg-card p-4 text-left shadow-[0_30px_90px_-30px_color-mix(in_oklch,var(--brand),transparent_40%)] sm:p-6"
        >
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value.slice(0, MAX_STORY_LENGTH))}
            placeholder={EXAMPLE}
            className="min-h-28 border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPersonaId(PIXAR_PERSONA_ID)}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                personaId === PIXAR_PERSONA_ID
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marketing/pixar-hero.jpg"
                alt="Style 3D Pixar"
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                <span className="text-sm font-semibold text-white">🎬 Style 3D Pixar</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPersonaId(FRUIT_PERSONA_ID)}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                personaId === FRUIT_PERSONA_ID
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fruitTemplate?.imageUrl}
                alt="Fruits qui parlent"
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                <span className="text-sm font-semibold text-white">🍌 Fruits qui parlent</span>
              </div>
            </button>
          </div>

          <Button
            size="lg"
            className="mt-4 w-full gap-2 shadow-[0_8px_30px_-8px_var(--brand)]"
            disabled={!story.trim() || !personaId || submitting}
            onClick={handleGenerate}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
            Générer ma vidéo
          </Button>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>3 crédits offerts à l&apos;inscription</span>
          <span>Aucune carte requise</span>
        </div>
      </div>
    </section>
  );
}
