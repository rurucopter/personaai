"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepIndicator } from "@/components/create/step-indicator";
import { UploadStep } from "@/components/create/upload-step";
import { PersonaStep } from "@/components/create/persona-step";
import { CustomizeStep } from "@/components/create/customize-step";
import { GenerateStep } from "@/components/create/generate-step";
import { GenerationProgress } from "@/components/create/generation-progress";
import { Button } from "@/components/ui/button";
import { computeGenerationCost } from "@/lib/credit-costs";
import type { TransformationSettings } from "@/types/ai-provider";
import type { VideoRow } from "@/types/database";

const DEFAULT_SETTINGS: Omit<TransformationSettings, "persona"> = {
  quality: "standard",
  energyLevel: 50,
  smileLevel: 50,
};

export function CreationWizard({ creditBalance }: { creditBalance: number }) {
  const [step, setStep] = useState(1);
  const [sourceVideoPath, setSourceVideoPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [settings, setSettings] =
    useState<Omit<TransformationSettings, "persona">>(DEFAULT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoRow | null>(null);

  const cost = computeGenerationCost({ ...settings, persona: personaId ?? "" });

  const canGoNext =
    (step === 1 && !!sourceVideoPath) ||
    (step === 2 && !!personaId) ||
    step === 3;

  async function handleGenerate() {
    if (!sourceVideoPath || !personaId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVideoPath,
          sourceDurationSeconds: durationSeconds,
          personaId,
          settings,
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

  if (video) {
    return <GenerationProgress initialVideo={video} />;
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
            <UploadStep
              previewUrl={previewUrl}
              onUploaded={(path, duration, preview) => {
                setSourceVideoPath(path);
                setDurationSeconds(duration);
                setPreviewUrl(preview);
              }}
              onReset={() => {
                setSourceVideoPath(null);
                setPreviewUrl(null);
                setDurationSeconds(null);
              }}
            />
          )}
          {step === 2 && (
            <PersonaStep selected={personaId} onSelect={setPersonaId} />
          )}
          {step === 3 && (
            <CustomizeStep settings={settings} onChange={setSettings} />
          )}
          {step === 4 && personaId && (
            <GenerateStep
              personaId={personaId}
              settings={settings}
              cost={cost}
              creditBalance={creditBalance}
              submitting={submitting}
              error={error}
              onGenerate={handleGenerate}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {step < 4 && (
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
      {step === 4 && (
        <Button variant="outline" className="w-fit gap-1" onClick={() => setStep(3)}>
          <ChevronLeft className="size-4" />
          Précédent
        </Button>
      )}
    </div>
  );
}
