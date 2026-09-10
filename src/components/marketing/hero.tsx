"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Heart,
  Loader2,
  Play,
  Star,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { PENDING_CREATION_KEY } from "@/lib/pending-creation";
import { normalizeImageToJpeg, blobToDataUrl } from "@/lib/normalize-image";
import { cn } from "@/lib/utils";

const PIXAR_PERSONA_ID = "pixar-3d";
const FRUIT_PERSONA_ID = "template:talking-banana";
const MAX_STORY_LENGTH = 1000;
const EXAMPLE =
  "Une fille rentre chez elle et dit à sa mère : \"Devine quoi, j'ai eu le poste !\" Sa mère la prend dans ses bras, folle de joie.";

const EXAMPLE_CHIPS = [
  { label: "🎉 Bonne nouvelle", story: EXAMPLE },
  {
    label: "💍 Demande en mariage",
    story:
      "Il met un genou à terre dans un parc et demande : \"Veux-tu m'épouser ?\" Elle pleure de joie et dit oui.",
  },
  {
    label: "🎓 Résultat d'examen",
    story:
      "Je regarde mes résultats sur mon téléphone et je hurle : \"J'ai réussi !\" en sautant partout de joie.",
  },
];

const PHONES = [
  {
    src: "/marketing/hero-fruit.jpg",
    label: "Fruits au chantier",
    views: "1.2M",
    likes: "84K",
    rotate: -6,
    scale: 0.92,
    zIndex: 1,
  },
  {
    src: "/marketing/pixar-hero.jpg",
    label: "Résultat du bac",
    views: "2.1M",
    likes: "142K",
    rotate: 0,
    scale: 1,
    zIndex: 3,
    featured: true,
  },
  {
    src: "/marketing/pixar-hero-2.jpg",
    label: "Demande en mariage",
    views: "847K",
    likes: "61K",
    rotate: 6,
    scale: 0.92,
    zIndex: 1,
  },
];

export function Hero() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [story, setStory] = useState("");
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [normalizingPhoto, setNormalizingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handlePhotoFile(file: File) {
    const looksLikeImage =
      file.type.startsWith("image/") ||
      /\.(png|jpe?g|webp|gif|bmp|heic|heif|avif)$/i.test(file.name);
    if (!looksLikeImage) {
      setPhotoError("Choisissez une image.");
      return;
    }
    setPhotoError(null);
    setNormalizingPhoto(true);
    try {
      const normalized = await normalizeImageToJpeg(file);
      setPhotoPreview(await blobToDataUrl(normalized));
    } catch {
      setPhotoError("Ce format d'image n'est pas pris en charge.");
    } finally {
      setNormalizingPhoto(false);
    }
  }

  async function handleGenerate() {
    if (!story.trim() || !personaId) return;
    setSubmitting(true);
    try {
      sessionStorage.setItem(
        PENDING_CREATION_KEY,
        JSON.stringify({
          story,
          personaId,
          durationSeconds: 5,
          photoDataUrl: photoPreview ?? undefined,
        })
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
      {/* Background effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_oklch,var(--brand),transparent_75%),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[400px] left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-2),transparent_88%),transparent_70%)] blur-3xl"
      />

      {/* ─── Headline ─── */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand"
        >
          <span className="flex items-center gap-1">
            <Star className="size-3 fill-brand text-brand" />
            4.8/5
          </span>
          <span className="h-3 w-px bg-brand/30" />
          Déjà +12 500 vidéos générées
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl lg:text-7xl"
        >
          Transformez vos histoires
          <br />
          en{" "}
          <span className="bg-gradient-to-r from-brand via-brand-2 to-brand bg-clip-text text-transparent">
            vidéos virales
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Écrivez un scénario, choisissez un style 3D cinématique, et
          l&apos;IA génère une vidéo professionnelle avec voix off
          — prête pour TikTok, Reels ou YouTube.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            className="gap-2 text-base shadow-[0_8px_30px_-8px_var(--brand)]"
            onClick={() =>
              document
                .getElementById("generator")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Essayer maintenant
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-base"
            onClick={() =>
              document
                .getElementById("fonctionnement")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Play className="size-4" />
            Comment ça marche
          </Button>
        </motion.div>
      </div>

      {/* ─── Phone showcase ─── */}
      <div className="mx-auto mt-16 flex max-w-4xl items-end justify-center gap-4 px-6 sm:gap-6">
        {PHONES.map((phone, i) => (
          <motion.div
            key={phone.src}
            initial={{ opacity: 0, y: 40, rotate: phone.rotate * 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: phone.rotate }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            style={{ zIndex: phone.zIndex, scale: phone.scale }}
            className={cn(
              "relative w-[140px] overflow-hidden rounded-[20px] border-2 sm:w-[200px] lg:w-[240px]",
              phone.featured
                ? "border-brand/50 shadow-[0_30px_80px_-20px_color-mix(in_oklch,var(--brand),transparent_40%)]"
                : "border-border/60 shadow-2xl"
            )}
          >
            {/* Notch */}
            <div className="absolute top-1.5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black sm:h-5 sm:w-20" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phone.src}
              alt={phone.label}
              className="aspect-[9/16] w-full object-cover"
            />
            {/* TikTok-style overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
              <div>
                <p className="text-xs font-semibold text-white sm:text-sm">
                  {phone.label}
                </p>
                <p className="mt-0.5 text-[10px] text-white/70 sm:text-xs">
                  PersonaAI
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col items-center">
                  <Heart className="size-4 fill-red-500 text-red-500 sm:size-5" />
                  <span className="text-[9px] font-semibold text-white sm:text-[10px]">
                    {phone.likes}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Eye className="size-4 text-white sm:size-5" />
                  <span className="text-[9px] font-semibold text-white sm:text-[10px]">
                    {phone.views}
                  </span>
                </div>
              </div>
            </div>
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:size-12">
                <Play className="size-4 fill-white text-white sm:size-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Stats strip ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-6 sm:gap-10"
      >
        {[
          { value: "12 500+", label: "vidéos générées" },
          { value: "2.1M", label: "vues cumulées" },
          { value: "4 200+", label: "créateurs actifs" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="text-2xl font-black text-foreground sm:text-3xl">
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ─── Generator form ─── */}
      <div
        id="generator"
        className="mx-auto mt-16 flex max-w-3xl flex-col items-center gap-6 px-6 pb-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Essayez maintenant
          </h2>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_30px_90px_-30px_color-mix(in_oklch,var(--brand),transparent_30%)] sm:p-6">
            <Textarea
              value={story}
              onChange={(e) =>
                setStory(e.target.value.slice(0, MAX_STORY_LENGTH))
              }
              placeholder={EXAMPLE}
              className="min-h-28 border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">
                Pas d&apos;idée ?
              </span>
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setStory(chip.story)}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPersonaId(PIXAR_PERSONA_ID)}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-xl border text-left transition-all",
                  personaId === PIXAR_PERSONA_ID
                    ? "border-primary ring-2 ring-primary shadow-[0_0_20px_-4px_var(--brand)]"
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
                  <span className="text-sm font-semibold text-white">
                    🎬 Style 3D Pixar
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPersonaId(FRUIT_PERSONA_ID)}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-xl border text-left transition-all",
                  personaId === FRUIT_PERSONA_ID
                    ? "border-primary ring-2 ring-primary shadow-[0_0_20px_-4px_var(--brand)]"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/hero-fruit.jpg"
                  alt="Fruits qui parlent"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                  <span className="text-sm font-semibold text-white">
                    🍌 Fruits qui parlent
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={normalizingPhoto}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-3 text-left transition-colors disabled:pointer-events-none disabled:opacity-60",
                  photoPreview
                    ? "border-primary bg-secondary/60"
                    : "border-border hover:bg-secondary/30"
                )}
              >
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/30">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Votre photo"
                      className="size-full object-cover"
                    />
                  ) : normalizingPhoto ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {photoPreview
                      ? "Photo ajoutée"
                      : "Ajouter votre photo (optionnel)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Apparaissez dans la vidéo générée.
                  </p>
                </div>
                {photoPreview && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoPreview(null);
                    }}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoFile(file);
                }}
              />
              {photoError && (
                <p className="mt-1.5 text-xs text-destructive">{photoError}</p>
              )}
            </div>

            <Button
              size="lg"
              className="mt-4 w-full gap-2 text-base shadow-[0_8px_30px_-8px_var(--brand)]"
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
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>Dès 9,99€/mois</span>
          <span className="h-3 w-px bg-border" />
          <span>Sans engagement</span>
          <span className="h-3 w-px bg-border" />
          <span>Vos vidéos restent privées</span>
        </div>
      </div>
    </section>
  );
}
