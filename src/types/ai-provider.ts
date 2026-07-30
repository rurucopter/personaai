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
  persona: string; // e.g. "ceo", "cyberpunk", "viking"
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
  durationSeconds?: number;
}

export interface GenerationJobInput {
  sourceVideoUrl: string;
  settings: TransformationSettings;
  webhookUrl?: string;
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
