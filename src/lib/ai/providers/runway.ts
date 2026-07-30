import type {
  GenerationJobHandle,
  GenerationJobInput,
  GenerationJobResult,
  VideoGenerationProvider,
} from "@/types/ai-provider";

/**
 * Runway adapter stub. Implement against Runway's Gen-3/Gen-4 API when
 * this provider is activated (set DEFAULT_AI_PROVIDER=runway).
 */
export const runwayProvider: VideoGenerationProvider = {
  name: "runway",

  async submitJob(_input: GenerationJobInput): Promise<GenerationJobHandle> {
    throw new Error("Runway provider not yet implemented");
  },

  async getJobStatus(_handle: GenerationJobHandle): Promise<GenerationJobResult> {
    throw new Error("Runway provider not yet implemented");
  },

  async cancelJob(_handle: GenerationJobHandle): Promise<void> {
    throw new Error("Runway provider not yet implemented");
  },
};
