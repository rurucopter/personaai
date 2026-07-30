export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

// Runway Gen-4 Aleph (the active generation model) hard-requires source
// videos under 16MB and only uses the first 5 seconds.
export const MAX_UPLOAD_SIZE_BYTES = 16 * 1024 * 1024;
export const MAX_USED_SOURCE_SECONDS = 5;

export function isAcceptedVideoFile(file: File): boolean {
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return true;
  return ACCEPTED_VIDEO_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}
