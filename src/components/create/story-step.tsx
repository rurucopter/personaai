"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_STORY_LENGTH = 1000;
const EXAMPLE =
  "Une fille rentre chez elle et dit à sa mère : \"Devine quoi, j'ai eu le poste !\" Sa mère la prend dans ses bras, folle de joie.";

interface StoryStepProps {
  story: string;
  onStoryChange: (story: string) => void;
  durationSeconds: 5 | 10;
  onDurationChange: (duration: 5 | 10) => void;
}

export function StoryStep({
  story,
  onStoryChange,
  durationSeconds,
  onDurationChange,
}: StoryStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Votre histoire</h3>
        <Textarea
          value={story}
          onChange={(e) => onStoryChange(e.target.value.slice(0, MAX_STORY_LENGTH))}
          placeholder={EXAMPLE}
          className="min-h-40"
        />
        <p className="text-xs text-muted-foreground">
          {story.length}/{MAX_STORY_LENGTH} — décrivez la scène, ajoutez des
          dialogues entre guillemets pour que les personnages parlent.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Durée</h3>
        <div className="flex gap-3">
          {([5, 10] as const).map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onDurationChange(seconds)}
              className={cn(
                "rounded-xl border px-5 py-3 text-sm font-medium transition-colors",
                durationSeconds === seconds
                  ? "border-primary bg-secondary/60"
                  : "border-border hover:bg-secondary/30"
              )}
            >
              {seconds} secondes
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
