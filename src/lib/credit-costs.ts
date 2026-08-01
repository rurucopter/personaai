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
