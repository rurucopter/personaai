import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Downloads a generated character image from the provider's (temporary) CDN
 * URL and re-hosts it in our own public "character-content" bucket, returning
 * the durable public URL. Falls back to the original URL if anything fails —
 * re-hosting is a durability improvement, not something that should block a
 * completed generation from reaching the user.
 */
export async function rehostCharacterImage(
  sourceUrl: string,
  userId: string,
  imageId: string
): Promise<string> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);

    const bytes = Buffer.from(await res.arrayBuffer());
    const supabase = createServiceRoleClient();
    const path = `${userId}/${imageId}.jpg`;

    const { error } = await supabase.storage
      .from("character-content")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("character-content").getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error("Character image re-hosting failed, using provider URL:", err);
    return sourceUrl;
  }
}
