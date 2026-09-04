/**
 * Provider-agnostic contract for video generation.
 * Every AI vendor (Fal.ai, Replicate, Runway, Luma, ...) implements this
 * interface so the rest of the app never depends on a specific vendor's SDK.
 */

export type GenerationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface TransformationSettings {
  persona: string; // e.g. "pixar-3d", "template:talking-banana"
  outfitStyle?: string;
  hairStyle?: string;
  colorPalette?: string;
  background?: string;
  lighting?: string;
  expression?: string;
  energyLevel?: number; // 0-100
  smileLevel?: number; // 0-100
  posture?: string;
  cameraAngle?: string;
  quality?: "standard" | "high" | "ultra";
}

export interface GenerationJobInput {
  /** Omitted for pure text-to-video generation — no source clip to edit. */
  sourceVideoUrl?: string;
  settings: TransformationSettings;
  /** Final prompt text, built once by the caller — adapters use this as-is
   *  rather than each re-deriving it from `settings`. */
  prompt: string;
  webhookUrl?: string;
  /** Still frame of a face, used by providers that support a style/identity
   *  reference image. Meaning depends on referenceMode. */
  referenceImageUrl?: string;
  /** "preserve" = referenceImageUrl is the user's own face (keep their
   *  identity while restyling). "become" = referenceImageUrl is a fictional
   *  AI character's face the person in the video should be replaced with.
   *  Some providers (Aleph) must treat these very differently: anchoring a
   *  keyframe to an unedited "preserve" frame froze the whole output. */
  referenceMode?: "preserve" | "become";
  /** Source video pixel dimensions, so providers that require an explicit
   *  output aspect ratio (e.g. Aleph) can match the original orientation
   *  instead of defaulting to landscape and cropping a vertical clip. */
  sourceWidth?: number;
  sourceHeight?: number;
  /** Text-to-video only: requested clip length in seconds. */
  durationSeconds?: 5 | 10;
  /** Text-to-video only: output frame aspect ratio. */
  aspectRatio?: "16:9" | "9:16" | "1:1";
  /** A photo the user uploaded to appear in the generated video — switches
   *  the story flow from pure text-to-video to image-to-video. */
  startImageUrl?: string;
}

export interface GenerationJobHandle {
  providerJobId: string;
  provider: string;
}

export interface GenerationJobResult {
  status: GenerationStatus;
  progress?: number; // 0-100
  resultVideoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  estimatedSecondsRemaining?: number;
}

/**
 * Every adapter must implement submit/getStatus/cancel.
 * Adapters are intentionally stateless; job state lives in the DB.
 */
export interface VideoGenerationProvider {
  readonly name: string;

  submitJob(input: GenerationJobInput): Promise<GenerationJobHandle>;

  getJobStatus(handle: GenerationJobHandle): Promise<GenerationJobResult>;

  cancelJob(handle: GenerationJobHandle): Promise<void>;
}
