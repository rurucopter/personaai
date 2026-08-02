"use client";

import Link from "next/link";
import { useEffect } from "react";
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

export function GenerationProgress({ initialVideo }: { initialVideo: VideoRow }) {
  const video = useVideoProgress(initialVideo);

  // Webhooks can't reach localhost in dev, so poll as a fallback — the
  // resulting DB update flows back through the realtime subscription above.
  useEffect(() => {
    if (video.status !== "queued" && video.status !== "processing") return;

    const interval = setInterval(() => {
      fetch(`/api/videos/${video.id}/poll`, { method: "POST" }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [video.id, video.status]);

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
      <p className="font-medium">{STATUS_LABEL[video.status]}</p>
      <Progress value={video.progress || null} />
      <p className="text-sm text-muted-foreground">
        Vous pouvez quitter cette page, la génération continue en arrière-plan.
      </p>
    </div>
  );
}
