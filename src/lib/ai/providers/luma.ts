import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";

/**
 * Luma adapter stub. Implement against Luma Dream Machine's API when
 * this provider is activated (set DEFAULT_AI_PROVIDER=luma).
 */
export const lumaProvider: VideoGenerationProvider = {
  name: "luma",

  async submitJob(_input: GenerationJobInput): Promise<GenerationJobHandle> {
    throw new Error("Luma provider not yet implemented");
  },

  async getJobStatus(_handle: GenerationJobHandle): Promise<GenerationJobResult> {
    throw new Error("Luma provider not yet implemented");
  },

  async cancelJob(_handle: GenerationJobHandle): Promise<void> {
    throw new Error("Luma provider not yet implemented");
  },
};
