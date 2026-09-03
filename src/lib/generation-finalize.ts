import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Marks a video failed and refunds its credits — but ONLY if this call is the
 * one that flips the row out of a non-terminal state. The `.in("status", …)`
 * guard makes the transition atomic, so a provider webhook, the poll fallback,
 * and provider webhook retries can't each refund the same job (which would
 * mint free credits, since refund_credits has no idempotency of its own).
 * Returns the updated row, or null if the job was already terminal (no refund).
 */
export async function failVideoAndRefund(
  service: SupabaseClient,
  video: { id: string; user_id: string; credits_spent: number },
  errorMessage: string
) {
  const { data: transitioned } = await service
    .from("videos")
    .update({ status: "failed", error_message: errorMessage })
    .eq("id", video.id)
    .in("status", ["queued", "processing"])
    .select();

  const updated = transitioned?.[0] ?? null;
  if (updated && video.credits_spent > 0) {
    await service.rpc("refund_credits", {
      p_user_id: video.user_id,
      p_amount: video.credits_spent,
      p_video_id: video.id,
    });
  }
  return updated;
}
