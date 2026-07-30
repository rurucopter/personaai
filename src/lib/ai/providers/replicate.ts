import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";

/**
 * Replicate adapter stub. Same contract as the Fal adapter — implement
 * submit/getJobStatus/cancel against Replicate's predictions API when this
 * provider is activated (set DEFAULT_AI_PROVIDER=replicate).
 */
export const replicateProvider: VideoGenerationProvider = {
  name: "replicate",

  async submitJob(_input: GenerationJobInput): Promise<GenerationJobHandle> {
    throw new Error("Replicate provider not yet implemented");
  },

  async getJobStatus(_handle: GenerationJobHandle): Promise<GenerationJobResult> {
    throw new Error("Replicate provider not yet implemented");
  },

  async cancelJob(_handle: GenerationJobHandle): Promise<void> {
    throw new Error("Replicate provider not yet implemented");
  },
};
