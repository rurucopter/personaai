"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  useCharacterImages,
  useCharacterProgress,
} from "@/hooks/use-character-image-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharacterImageRow, CharacterRow } from "@/types/database";

const STATUS_LABEL: Record<CharacterImageRow["status"], string> = {
  queued: "En file d'attente",
  processing: "Génération en cours",
  completed: "Terminé",
  failed: "Échec",
  cancelled: "Annulé",
};

interface CharacterViewProps {
  character: CharacterRow;
  initialImages: CharacterImageRow[];
}

export function CharacterView({ character: initialCharacter, initialImages }: CharacterViewProps) {
  const character = useCharacterProgress(initialCharacter);
  const images = useCharacterImages(character.id, initialImages).filter((img) => !img.is_reference);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Webhooks can't reach localhost in dev, so poll pending images as a
  // fallback — the resulting DB update flows back through realtime above.
  useEffect(() => {
    const pending = images.filter((img) => img.status === "queued" || img.status === "processing");
    if (pending.length === 0) return;

    const interval = setInterval(() => {
      for (const img of pending) {
        fetch(`/api/characters/images/${img.id}/poll`, { method: "POST" }).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/characters/${character.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la génération.");
        return;
      }

      setPrompt("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{character.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/30">
            {character.reference_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={character.reference_image_url}
                alt={character.name}
                className="size-full object-cover"
              />
            ) : (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{character.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouvelle image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form onSubmit={handleGenerate} className="flex gap-3">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="En terrasse face à la mer, lumière du soir..."
              disabled={!character.reference_image_url || loading}
              required
            />
            <Button type="submit" disabled={!character.reference_image_url || loading} className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Générer (1 crédit)
            </Button>
          </form>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-secondary/30">
                {img.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.image_url}
                    alt={img.prompt}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs text-muted-foreground">{img.prompt}</p>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {STATUS_LABEL[img.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
