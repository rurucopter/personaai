"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  isAcceptedVideoFile,
  MAX_SOURCE_SECONDS,
  MAX_UPLOAD_SIZE_BYTES,
  MIN_SOURCE_SECONDS,
  MIN_SOURCE_WIDTH_PX,
  UPLOAD_CONSTRAINTS_NOTE,
} from "@/lib/upload-constraints";
import { upscaleVideo } from "@/lib/video-upscale";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadStepProps {
  onUploaded: (
    path: string,
    durationSeconds: number,
    previewUrl: string,
    referenceFramePath: string | null
  ) => void;
  onReset: () => void;
  previewUrl: string | null;
}

type Phase = "idle" | "upscaling" | "uploading";

export function UploadStep({ onUploaded, onReset, previewUrl }: UploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [upscaleProgress, setUpscaleProgress] = useState(0);
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

  function grabFrame(file: File, atSeconds: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      const localUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.src = localUrl;

      video.onloadeddata = () => {
        video.currentTime = Math.min(atSeconds, Math.max(0, video.duration - 0.1));
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(localUrl);
          resolve(null);
          return;
        }

        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(localUrl);
            resolve(blob);
          },
          "image/jpeg",
          0.92
        );
      };

      video.onerror = () => {
        URL.revokeObjectURL(localUrl);
        resolve(null);
      };
    });
  }

  function readVideoMeta(
    file: File
  ): Promise<{ duration: number; width: number; height: number; localUrl: string }> {
    return new Promise((resolve, reject) => {
      const localUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          localUrl,
        });
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
      setError(
        `Fichier trop volumineux (${(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0)} Mo maximum).`
      );
      return;
    }

    try {
      let { duration, width, height, localUrl } = await readVideoMeta(file);

      if (duration < MIN_SOURCE_SECONDS || duration > MAX_SOURCE_SECONDS) {
        setError(
          `Durée non supportée (${duration.toFixed(1)}s). Utilisez une vidéo de ${MIN_SOURCE_SECONDS} à ${MAX_SOURCE_SECONDS} secondes.`
        );
        URL.revokeObjectURL(localUrl);
        return;
      }

      let fileToUpload = file;

      if (Math.min(width, height) < MIN_SOURCE_WIDTH_PX) {
        setPhase("upscaling");
        setUpscaleProgress(0);

        try {
          fileToUpload = await upscaleVideo(file, MIN_SOURCE_WIDTH_PX, setUpscaleProgress);
        } catch {
          setError(
            "Impossible d'améliorer automatiquement la résolution de cette vidéo. Essayez une vidéo filmée en HD/1080p."
          );
          URL.revokeObjectURL(localUrl);
          return;
        }

        URL.revokeObjectURL(localUrl);
        const upscaled = await readVideoMeta(fileToUpload);
        duration = upscaled.duration;
        width = upscaled.width;
        height = upscaled.height;
        localUrl = upscaled.localUrl;
      }

      setPhase("uploading");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez être connecté.");
        return;
      }

      const path = `${user.id}/${Date.now()}-${sanitizeFileName(fileToUpload.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("source-videos")
        .upload(path, fileToUpload);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      // Best-effort: a still frame of the person's face, uploaded alongside
      // the video, lets the AI anchor identity more strongly. Not fatal if
      // it fails — generation still works from the video alone.
      let referenceFramePath: string | null = null;
      const frameBlob = await grabFrame(fileToUpload, duration / 2);

      if (frameBlob) {
        const framePath = `${user.id}/${Date.now()}-frame.jpg`;
        const { error: frameUploadError } = await supabase.storage
          .from("video-frames")
          .upload(framePath, frameBlob, { contentType: "image/jpeg" });

        if (!frameUploadError) referenceFramePath = framePath;
      }

      onUploaded(path, duration, localUrl, referenceFramePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import.");
    } finally {
      setPhase("idle");
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
          <p className="text-sm text-muted-foreground">{UPLOAD_CONSTRAINTS_NOTE}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={phase !== "idle"}
          onClick={() => inputRef.current?.click()}
        >
          {phase === "upscaling"
            ? "Amélioration de la qualité..."
            : phase === "uploading"
              ? "Import en cours..."
              : "Parcourir"}
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

      {phase === "upscaling" && <Progress value={upscaleProgress * 100} />}
      {phase === "uploading" && <Progress value={null} className="animate-pulse" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
