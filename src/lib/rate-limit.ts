import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_GENERATIONS_PER_HOUR = 20;

/**
 * Simple DB-backed rate limit: counts generations started by this user in
 * the last hour. Good enough at current scale; swap for a Redis/Upstash
 * counter if generation volume grows.
 */
export async function isUnderGenerationRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  // Fail open on a transient count error — a rate-limit check should never
  // itself become a 500 that blocks a legitimate generation.
  if (error) {
    console.error("rate-limit count failed, allowing request:", error);
    return true;
  }

  return (count ?? 0) < MAX_GENERATIONS_PER_HOUR;
}
