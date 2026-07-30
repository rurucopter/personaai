"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Heart,
  Loader2,
  MoreVertical,
  Trash2,
  Copy as DuplicateIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPersonaById } from "@/lib/personas";
import type { VideoRow } from "@/types/database";

const STATUS_LABEL: Record<VideoRow["status"], string> = {
  queued: "En file d'attente",
  processing: "En cours",
  completed: "Terminé",
  failed: "Échec",
  cancelled: "Annulé",
};

const STATUS_VARIANT: Record<VideoRow["status"], "secondary" | "destructive"> = {
  queued: "secondary",
  processing: "secondary",
  completed: "secondary",
  failed: "destructive",
  cancelled: "destructive",
};

interface VideoCardProps {
  video: VideoRow;
  isFavorite: boolean;
}

export function VideoCard({ video, isFavorite }: VideoCardProps) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [busy, setBusy] = useState(false);
  const persona = getPersonaById(video.persona);

  async function toggleFavorite() {
    setFavorite((f) => !f);
    const res = await fetch(`/api/videos/${video.id}/favorite`, { method: "POST" });
    if (!res.ok) {
      setFavorite((f) => !f);
      toast.error("Impossible de mettre à jour les favoris.");
    }
  }

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      toast.error("Suppression impossible.");
      return;
    }
    toast.success("Vidéo supprimée.");
    router.refresh();
  }

  async function handleDuplicate() {
    setBusy(true);
    const res = await fetch(`/api/videos/${video.id}/duplicate`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Duplication impossible.");
      return;
    }
    toast.success("Génération dupliquée, elle apparaîtra sous peu.");
    router.refresh();
  }

  async function handleShare() {
    if (!video.result_video_url) return;
    await navigator.clipboard.writeText(video.result_video_url);
    toast.success("Lien copié dans le presse-papiers.");
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border">
      <div className="aspect-video bg-muted">
        {video.status === "completed" && video.result_video_url ? (
          <video
            src={video.result_video_url}
            poster={video.thumbnail_url ?? undefined}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {video.status === "processing" || video.status === "queued" ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <span className="text-sm">Aucun aperçu</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{persona?.label ?? video.persona}</p>
          <Badge variant={STATUS_VARIANT[video.status]} className="mt-1">
            {STATUS_LABEL[video.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleFavorite} aria-label="Favori">
            <Heart className={favorite ? "size-4 fill-current text-destructive" : "size-4"} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {video.result_video_url && (
                <DropdownMenuItem
                  render={
                    <a href={video.result_video_url} download target="_blank" rel="noreferrer" />
                  }
                >
                  <Download className="size-4" />
                  Télécharger
                </DropdownMenuItem>
              )}
              {video.result_video_url && (
                <DropdownMenuItem onClick={handleShare}>
                  <Copy className="size-4" />
                  Partager
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicate} disabled={busy}>
                <DuplicateIcon className="size-4" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
                disabled={busy}
              >
                <Trash2 className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
