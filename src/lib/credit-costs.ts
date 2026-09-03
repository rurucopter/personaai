import type { TransformationSettings } from "@/types/ai-provider";

const QUALITY_COST: Record<NonNullable<TransformationSettings["quality"]>, number> = {
  standard: 1,
  high: 2,
  ultra: 4,
};

export function computeGenerationCost(settings: TransformationSettings): number {
  return QUALITY_COST[settings.quality ?? "standard"];
}

export const CHARACTER_IMAGE_COST = 1;

const STORY_VIDEO_COST: Record<5 | 10, number> = {
  5: 1,
  10: 2,
};

/** Text-to-video generation costs more per clip than restyling an existing
 *  video, so it's priced separately, by requested duration. */
export function computeStoryVideoCost(durationSeconds: 5 | 10): number {
  return STORY_VIDEO_COST[durationSeconds];
}
