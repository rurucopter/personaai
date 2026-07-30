"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoCard } from "@/components/videos/video-card";
import { PERSONAS } from "@/lib/personas";
import { cn } from "@/lib/utils";
import type { VideoRow } from "@/types/database";

interface VideoGalleryProps {
  videos: VideoRow[];
  favoriteIds: Set<string>;
}

export function VideoGallery({ videos, favoriteIds }: VideoGalleryProps) {
  const [search, setSearch] = useState("");
  const [personaFilter, setPersonaFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filtered = useMemo(() => {
    return videos.filter((video) => {
      if (favoritesOnly && !favoriteIds.has(video.id)) return false;
      if (personaFilter !== "all" && video.persona !== personaFilter) return false;
      if (search && !video.persona.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [videos, search, personaFilter, favoritesOnly, favoriteIds]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Rechercher par persona..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <Select value={personaFilter} onValueChange={(v) => v && setPersonaFilter(v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les personas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les personas</SelectItem>
            {PERSONAS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={favoritesOnly ? "default" : "outline"}
          className={cn("gap-2")}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          <Heart className="size-4" />
          Favoris
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune vidéo ne correspond.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} isFavorite={favoriteIds.has(video.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
