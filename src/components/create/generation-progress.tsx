"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import type { VideoRow } from "@/types/database";

const STATUS_LABEL: Record<VideoRow["status"], string> = {
  queued: "En file d'attente",
  processing: "Génération en cours",
  completed: "Terminé",
  failed: "Échec",
  cancelled: "Annulé",
};

// Rotating messages tied to elapsed time so the wait reads as real stages
// happening, not a frozen spinner — the provider gives us no real substeps,
// so this is a best-effort narrative over the same single black-box call.
const STAGE_MESSAGES: { afterSeconds: number; text: string }[] = [
  { afterSeconds: 0, text: "Lecture de votre histoire…" },
  { afterSeconds: 12, text: "Mise en scène des personnages…" },
  { afterSeconds: 30, text: "Animation image par image…" },
  { afterSeconds: 55, text: "Synchronisation des voix et des dialogues…" },
  { afterSeconds: 90, text: "Ajustement des couleurs et de la lumière…" },
  { afterSeconds: 130, text: "Dernières retouches avant l'export…" },
];

function currentStageMessage(elapsedSec: number): string {
  let text = STAGE_MESSAGES[0].text;
  for (const stage of STAGE_MESSAGES) {
    if (elapsedSec >= stage.afterSeconds) text = stage.text;
  }
  return text;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function personaPreviewImage(persona: string): string | undefined {
  if (persona === "pixar-3d") return "/marketing/pixar-hero.jpg";
  if (persona.startsWith("template:")) {
    return getAvatarTemplateById(persona.slice("template:".length))?.imageUrl;
  }
  return undefined;
}

export function GenerationProgress({
  initialVideo,
  onRestart,
}: {
  initialVideo: VideoRow;
  onRestart?: () => void;
}) {
  const video = useVideoProgress(initialVideo);
  const [now, setNow] = useState(() => Date.now());

  const isPending = video.status === "queued" || video.status === "processing";
  const previewImage = useMemo(() => personaPreviewImage(video.persona), [video.persona]);

  // Webhooks can't reach localhost in dev, so poll as a fallback — the
  // resulting DB update flows back through the realtime subscription above.
  useEffect(() => {
    if (!isPending) return;

    const interval = setInterval(() => {
      fetch(`/api/videos/${video.id}/poll`, { method: "POST" }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [video.id, isPending]);

  // Tick every second so the elapsed time and estimated progress advance —
  // the provider doesn't report granular progress, so without this the bar
  // would sit frozen and a slow-but-healthy job looks indistinguishable
  // from a stuck one.
  useEffect(() => {
    if (!isPending) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isPending]);

  const elapsedSec = Math.max(0, Math.floor((now - new Date(video.created_at).getTime()) / 1000));
  // Ease asymptotically toward ~92% over a few minutes; real completion snaps
  // it to 100%. Uses the provider's own progress if it ever reports higher.
  const estimated = Math.round(92 * (1 - Math.exp(-elapsedSec / 130)));
  const displayProgress = Math.max(video.progress || 0, estimated);
  const remainingEstimate = Math.max(0, 150 - elapsedSec);

  if (video.status === "completed") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border p-10 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <div>
          <p className="font-medium">Votre vidéo est prête</p>
          <p className="text-sm text-muted-foreground">
            Retrouvez-la dans « Mes vidéos ».
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button render={<Link href="/dashboard/videos" />} nativeButton={false}>
            Voir mes vidéos
          </Button>
          {onRestart && (
            <Button variant="outline" onClick={onRestart}>
              Nouvelle transformation
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (video.status === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 p-10 text-center">
        <XCircle className="size-10 text-destructive" />
        <div>
          <p className="font-medium">La génération a échoué</p>
          <p className="text-sm text-muted-foreground">
            {video.error_message ?? "Vos crédits ont été remboursés."}
          </p>
        </div>
        {onRestart ? (
          <Button onClick={onRestart}>Réessayer</Button>
        ) : (
          <Button render={<Link href="/dashboard/create" />} nativeButton={false}>
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {previewImage && (
        <div className="relative h-40 w-full overflow-hidden sm:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt=""
            aria-hidden
            className="size-full scale-110 object-cover blur-sm brightness-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-full border-2 border-white/40 border-t-white">
              <div className="size-14 animate-spin rounded-full border-2 border-transparent border-t-white" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 p-10 text-center">
        <div className="flex items-center justify-center gap-3">
          <p className="font-medium">{STATUS_LABEL[video.status]}</p>
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatElapsed(elapsedSec)}
          </span>
        </div>
        <Progress value={displayProgress} />
        <p key={currentStageMessage(elapsedSec)} className="animate-in fade-in text-sm font-medium text-foreground duration-500">
          {currentStageMessage(elapsedSec)}
        </p>
        <p className="text-sm text-muted-foreground">
          {remainingEstimate > 0
            ? `Encore environ ${formatElapsed(remainingEstimate)} — vous pouvez quitter cette page, la génération continue en arrière-plan.`
            : "Presque terminé — quelques instants supplémentaires pour les vidéos avec dialogues."}
        </p>
      </div>
    </div>
  );
}
