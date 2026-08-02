// Kling O1 Edit (the active generation model, via fal.ai) hard-requires
// .mp4/.mov source videos, 3-10 seconds long, 720-2160px resolution, max 200MB.
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov"];
export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024;
export const MIN_SOURCE_SECONDS = 3;
export const MAX_SOURCE_SECONDS = 10;
export const MIN_SOURCE_WIDTH_PX = 720;

export function isAcceptedVideoFile(file: File): boolean {
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return true;
  return ACCEPTED_VIDEO_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}
