import type { VideoGenerationProvider } from "@/types/ai-provider";
import { falProvider } from "./providers/fal";
import { replicateProvider } from "./providers/replicate";
import { runwayProvider } from "./providers/runway";
import { lumaProvider } from "./providers/luma";

const providers: Record<string, VideoGenerationProvider> = {
  fal: falProvider,
  replicate: replicateProvider,
  runway: runwayProvider,
  luma: lumaProvider,
};

/**
 * Single entry point the rest of the app uses to get a provider.
 * Swapping the default vendor is a one-line env var change.
 */
export function getVideoProvider(name?: string): VideoGenerationProvider {
  const key = name ?? process.env.DEFAULT_AI_PROVIDER ?? "fal";
  const provider = providers[key];
  if (!provider) {
    throw new Error(`Unknown AI provider: ${key}`);
  }
  return provider;
}
