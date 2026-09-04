"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { normalizeImageToJpeg } from "@/lib/normalize-image";
import { cn } from "@/lib/utils";

const MAX_STORY_LENGTH = 1000;
const EXAMPLE =
  "Une fille rentre chez elle et dit à sa mère : \"Devine quoi, j'ai eu le poste !\" Sa mère la prend dans ses bras, folle de joie.";

interface StoryStepProps {
  story: string;
  onStoryChange: (story: string) => void;
  durationSeconds: 5 | 10;
  onDurationChange: (duration: 5 | 10) => void;
  photoPreview: string | null;
  onPhotoUploaded: (path: string, previewUrl: string) => void;
  onPhotoRemoved: () => void;
}

export function StoryStep({
  story,
  onStoryChange,
  durationSeconds,
  onDurationChange,
  photoPreview,
  onPhotoUploaded,
  onPhotoRemoved,
}: StoryStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoFile(file: File) {
    const looksLikeImage =
      file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|heic|heif|avif)$/i.test(file.name);
    if (!looksLikeImage) {
      setError("Choisissez une image.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const normalized = await normalizeImageToJpeg(file);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Vous devez être connecté.");
        return;
      }

      const path = `${user.id}/${Date.now()}-story-photo.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("video-frames")
        .upload(path, normalized, { contentType: "image/jpeg" });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      onPhotoUploaded(path, URL.createObjectURL(normalized));
    } catch {
      setError("Ce format d'image n'est pas pris en charge.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Votre histoire</h3>
        <Textarea
          value={story}
          onChange={(e) => onStoryChange(e.target.value.slice(0, MAX_STORY_LENGTH))}
          placeholder={EXAMPLE}
          className="min-h-40"
        />
        <p className="text-xs text-muted-foreground">
          {story.length}/{MAX_STORY_LENGTH} — décrivez la scène, ajoutez des
          dialogues entre guillemets pour que les personnages parlent.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Votre photo (optionnel)
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex items-center gap-3 rounded-xl border-2 border-dashed p-3 text-left transition-colors disabled:pointer-events-none disabled:opacity-60",
            photoPreview
              ? "border-primary bg-secondary/60"
              : "border-border hover:bg-secondary/30"
          )}
        >
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/30">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Votre photo" className="size-full object-cover" />
            ) : uploading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {photoPreview ? "Photo ajoutée" : "Ajouter votre photo"}
            </p>
            <p className="text-xs text-muted-foreground">Apparaissez dans la vidéo générée.</p>
          </div>
          {photoPreview && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onPhotoRemoved();
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
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Durée</h3>
        <div className="flex gap-3">
          {([5, 10] as const).map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onDurationChange(seconds)}
              className={cn(
                "rounded-xl border px-5 py-3 text-sm font-medium transition-colors",
                durationSeconds === seconds
                  ? "border-primary bg-secondary/60"
                  : "border-border hover:bg-secondary/30"
              )}
            >
              {seconds} secondes
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
