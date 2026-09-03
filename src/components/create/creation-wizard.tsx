"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepIndicator } from "@/components/create/step-indicator";
import { StoryStep } from "@/components/create/story-step";
import { PersonaStep } from "@/components/create/persona-step";
import { GenerateStep } from "@/components/create/generate-step";
import { GenerationProgress } from "@/components/create/generation-progress";
import { Button } from "@/components/ui/button";
import { computeStoryVideoCost } from "@/lib/credit-costs";
import type { VideoRow } from "@/types/database";

interface CreationWizardProps {
  creditBalance: number;
}

export function CreationWizard({ creditBalance }: CreationWizardProps) {
  const [step, setStep] = useState(1);
  const [story, setStory] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<5 | 10>(5);
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoRow | null>(null);

  const cost = computeStoryVideoCost(durationSeconds);

  const canGoNext = (step === 1 && story.trim().length > 0) || step === 2;

  async function handleGenerate() {
    if (!story.trim() || !personaId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story,
          personaId,
          durationSeconds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setVideo(data.video as VideoRow);
    } finally {
      setSubmitting(false);
    }
  }

  function resetWizard() {
    setVideo(null);
    setStep(1);
    setStory("");
    setDurationSeconds(5);
    setPersonaId(null);
    setError(null);
  }

  if (video) {
    return <GenerationProgress initialVideo={video} onRestart={resetWizard} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <StoryStep
              story={story}
              onStoryChange={setStory}
              durationSeconds={durationSeconds}
              onDurationChange={setDurationSeconds}
            />
          )}
          {step === 2 && <PersonaStep selected={personaId} onSelect={setPersonaId} />}
          {step === 3 && personaId && (
            <GenerateStep
              personaId={personaId}
              cost={cost}
              creditBalance={creditBalance}
              submitting={submitting}
              error={error}
              onGenerate={handleGenerate}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {step < 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="gap-1"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="size-4" />
            Précédent
          </Button>
          <Button
            className="gap-1"
            disabled={!canGoNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Suivant
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      {step === 3 && (
        <Button variant="outline" className="w-fit gap-1" onClick={() => setStep(2)}>
          <ChevronLeft className="size-4" />
          Précédent
        </Button>
      )}
    </div>
  );
}
