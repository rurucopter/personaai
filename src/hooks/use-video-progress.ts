"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VideoRow } from "@/types/database";

/**
 * Subscribes to Supabase Realtime for a single video row so generation
 * progress updates live (queued -> processing -> completed/failed).
 */
export function useVideoProgress(initialVideo: VideoRow) {
  const [video, setVideo] = useState<VideoRow>(initialVideo);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`video-${initialVideo.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${initialVideo.id}`,
        },
        (payload) => setVideo(payload.new as VideoRow)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialVideo.id]);

  return video;
}
