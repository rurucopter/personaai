"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CharacterImageRow, CharacterRow } from "@/types/database";

/** Mirrors useVideoProgress, but for a character's reference portrait. */
export function useCharacterProgress(initialCharacter: CharacterRow) {
  const [character, setCharacter] = useState<CharacterRow>(initialCharacter);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`character-${initialCharacter.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ai_characters",
          filter: `id=eq.${initialCharacter.id}`,
        },
        (payload) => setCharacter(payload.new as CharacterRow)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialCharacter.id]);

  return character;
}

/** Live gallery of a character's generated images (reference + scenes). */
export function useCharacterImages(characterId: string, initialImages: CharacterImageRow[]) {
  const [images, setImages] = useState<CharacterImageRow[]>(initialImages);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`character-images-${characterId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "character_images", filter: `character_id=eq.${characterId}` },
        (payload) => setImages((prev) => [payload.new as CharacterImageRow, ...prev])
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "character_images", filter: `character_id=eq.${characterId}` },
        (payload) =>
          setImages((prev) =>
            prev.map((img) => (img.id === payload.new.id ? (payload.new as CharacterImageRow) : img))
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [characterId]);

  return images;
}
