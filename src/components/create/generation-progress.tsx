"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoRow } from "@/types/database";

const STATUS_LABEL: Record<VideoRow["status"], string> = {
  queued: "En file d'attente",
  processing: "Génération en cours",
  completed: "Terminé",
  failed: "Échec",
  cancelled: "Annulé",
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GenerationProgress({ initialVideo }: { initialVideo: VideoRow }) {
  const video = useVideoProgress(initialVideo);
  const [now, setNow] = useState(() => Date.now());

  const isPending = video.status === "queued" || video.status === "processing";

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
        <Button render={<Link href="/dashboard/videos" />} nativeButton={false}>
          Voir mes vidéos
        </Button>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-10 text-center">
      <div className="flex items-center justify-center gap-3">
        <p className="font-medium">{STATUS_LABEL[video.status]}</p>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatElapsed(elapsedSec)}
        </span>
      </div>
      <Progress value={displayProgress} />
      <p className="text-sm text-muted-foreground">
        La génération prend généralement 2 à 5 minutes. Vous pouvez quitter
        cette page, elle continue en arrière-plan.
      </p>
    </div>
  );
}
