"use client";

import { useRef, useState } from "react";
import { ChevronDown, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PERSONA_CATEGORIES, getPersonasByCategory } from "@/lib/personas";
import { AVATAR_TEMPLATES } from "@/lib/avatar-templates";
import { cn } from "@/lib/utils";
import type { CharacterRow } from "@/types/database";

const PHOTO_PREFIX = "photo:";

interface PersonaStepProps {
  selected: string | null;
  onSelect: (personaId: string) => void;
  characters: CharacterRow[];
}

export function PersonaStep({ selected, onSelect, characters }: PersonaStepProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMoreStyles, setShowMoreStyles] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPhotoSelected = selected?.startsWith(PHOTO_PREFIX) ?? false;

  async function handlePhotoFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez choisir une image.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez être connecté.");
        return;
      }

      const path = `${user.id}/${Date.now()}-custom-photo.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("video-frames")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      setPhotoPreview(URL.createObjectURL(file));
      onSelect(`${PHOTO_PREFIX}${path}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Votre propre photo — devenez n&apos;importe qui
        </h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex items-center gap-4 rounded-xl border-2 border-dashed p-4 text-left transition-colors disabled:pointer-events-none disabled:opacity-60",
            isPhotoSelected
              ? "border-primary bg-secondary/60"
              : "border-border hover:bg-secondary/30"
          )}
        >
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/30">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Photo importée" className="size-full object-cover" />
            ) : uploading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isPhotoSelected ? "Photo sélectionnée" : "Importer une photo"}
            </p>
            <p className="text-sm text-muted-foreground">
              La vidéo deviendra cette personne, avec son visage exact.
            </p>
          </div>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePhotoFile(file);
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {characters.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">Mes personnages IA</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {characters.map((character) => {
              const id = `character:${character.id}`;
              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                    selected === id
                      ? "border-primary bg-secondary/60"
                      : "border-border hover:bg-secondary/30"
                  )}
                >
                  <div className="aspect-square overflow-hidden bg-secondary/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={character.reference_image_url!}
                      alt={character.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <span className="font-medium">{character.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Avatars IA — devenez cette personne
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AVATAR_TEMPLATES.map((template) => {
            const id = `template:${template.id}`;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(id)}
                className={cn(
                  "flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                  selected === id
                    ? "border-primary bg-secondary/60"
                    : "border-border hover:bg-secondary/30"
                )}
              >
                <div className="aspect-square overflow-hidden bg-secondary/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <span className="font-medium">{template.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setShowMoreStyles((s) => !s)}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown className={cn("size-4 transition-transform", showMoreStyles && "rotate-180")} />
          {showMoreStyles ? "Masquer les styles prédéfinis" : "Voir plus de styles prédéfinis"}
        </button>

        {showMoreStyles &&
          PERSONA_CATEGORIES.map((category) => (
            <div key={category} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {getPersonasByCategory(category).map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => onSelect(persona.id)}
                    className={cn(
                      "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors",
                      selected === persona.id
                        ? "border-primary bg-secondary/60"
                        : "border-border hover:bg-secondary/30"
                    )}
                  >
                    <span className="font-medium">{persona.label}</span>
                    <span className="text-xs text-muted-foreground">{persona.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
