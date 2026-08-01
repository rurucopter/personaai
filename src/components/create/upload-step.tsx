"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  isAcceptedVideoFile,
  MAX_SOURCE_SECONDS,
  MAX_UPLOAD_SIZE_BYTES,
  MIN_SOURCE_SECONDS,
} from "@/lib/upload-constraints";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadStepProps {
  onUploaded: (path: string, durationSeconds: number, previewUrl: string) => void;
  onReset: () => void;
  previewUrl: string | null;
}

export function UploadStep({ onUploaded, onReset, previewUrl }: UploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function sanitizeFileName(name: string): string {
    const dotIndex = name.lastIndexOf(".");
    const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
    const ext = dotIndex > 0 ? name.slice(dotIndex + 1) : "mp4";

    const cleanBase = base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    return `${cleanBase || "video"}.${ext.toLowerCase()}`;
  }

  function readDuration(file: File): Promise<{ duration: number; localUrl: string }> {
    return new Promise((resolve, reject) => {
      const localUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve({ duration: video.duration, localUrl });
      video.onerror = () => reject(new Error("Impossible de lire cette vidéo."));
      video.src = localUrl;
    });
  }

  async function handleFile(file: File) {
    setError(null);

    if (!isAcceptedVideoFile(file)) {
      setError("Format non supporté. Utilisez MP4 ou MOV.");
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError("Fichier trop volumineux (200 Mo maximum).");
      return;
    }

    setUploading(true);

    try {
      const { duration, localUrl } = await readDuration(file);

      if (duration < MIN_SOURCE_SECONDS || duration > MAX_SOURCE_SECONDS) {
        setError(
          `Durée non supportée (${duration.toFixed(1)}s). Utilisez une vidéo de ${MIN_SOURCE_SECONDS} à ${MAX_SOURCE_SECONDS} secondes.`
        );
        URL.revokeObjectURL(localUrl);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez être connecté.");
        return;
      }

      const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("source-videos")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      onUploaded(path, duration, localUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import.");
    } finally {
      setUploading(false);
    }
  }

  if (previewUrl) {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-xl border border-border">
          <video src={previewUrl} controls className="max-h-96 w-full bg-black" />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3"
            onClick={onReset}
            aria-label="Retirer la vidéo"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors",
          dragging && "border-primary bg-secondary/40"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <UploadCloud className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium">Glissez-déposez votre vidéo</p>
          <p className="text-sm text-muted-foreground">
            MP4 ou MOV — {MIN_SOURCE_SECONDS} à {MAX_SOURCE_SECONDS} secondes, 200 Mo
            maximum.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Import en cours..." : "Parcourir"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {uploading && <Progress value={null} className="animate-pulse" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
