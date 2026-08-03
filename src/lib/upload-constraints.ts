// Each AI provider has different real hard limits on the source video.
// These are picked at runtime from NEXT_PUBLIC_AI_PROVIDER so client-side
// validation always matches whichever model is actually configured —
// mismatched limits here just mean a wasted, confusing failed generation.
interface ProviderVideoConstraints {
  maxUploadSizeBytes: number;
  minSourceSeconds: number;
  maxSourceSeconds: number;
  minSourceWidthPx: number;
  note: string;
}

const PROVIDER_CONSTRAINTS: Record<string, ProviderVideoConstraints> = {
  fal: {
    // Kling O1 Edit: .mp4/.mov, 3-10s, 720-2160px, max 200MB.
    maxUploadSizeBytes: 200 * 1024 * 1024,
    minSourceSeconds: 3,
    maxSourceSeconds: 10,
    minSourceWidthPx: 720,
    note: "MP4 ou MOV — 3 à 10 secondes, HD (720px minimum), 200 Mo maximum.",
  },
  runway: {
    // Runway Aleph 2.0 via Replicate: 2-30 seconds, max 16MB.
    maxUploadSizeBytes: 16 * 1024 * 1024,
    minSourceSeconds: 2,
    maxSourceSeconds: 30,
    minSourceWidthPx: 480,
    note: "MP4 ou MOV — 2 à 30 secondes, 16 Mo maximum.",
  },
};

const activeConstraints =
  PROVIDER_CONSTRAINTS[process.env.NEXT_PUBLIC_AI_PROVIDER ?? "fal"] ?? PROVIDER_CONSTRAINTS.fal;

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov"];
export const MAX_UPLOAD_SIZE_BYTES = activeConstraints.maxUploadSizeBytes;
export const MIN_SOURCE_SECONDS = activeConstraints.minSourceSeconds;
export const MAX_SOURCE_SECONDS = activeConstraints.maxSourceSeconds;
export const MIN_SOURCE_WIDTH_PX = activeConstraints.minSourceWidthPx;
export const UPLOAD_CONSTRAINTS_NOTE = activeConstraints.note;

export function isAcceptedVideoFile(file: File): boolean {
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return true;
  return ACCEPTED_VIDEO_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}
