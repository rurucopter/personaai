"use client";

import { useId } from "react";
import {
  BACKGROUNDS,
  CAMERA_ANGLES,
  COLOR_PALETTES,
  EXPRESSIONS,
  HAIR_STYLES,
  LIGHTING_OPTIONS,
  OUTFIT_STYLES,
  POSTURES,
  QUALITY_LEVELS,
} from "@/lib/transformation-options";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { TransformationSettings } from "@/types/ai-provider";

interface CustomizeStepProps {
  settings: Omit<TransformationSettings, "persona">;
  onChange: (settings: Omit<TransformationSettings, "persona">) => void;
}

function OptionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Choisir..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CustomizeStep({ settings, onChange }: CustomizeStepProps) {
  const qualityId = useId();

  function set<K extends keyof Omit<TransformationSettings, "persona">>(
    key: K,
    value: Omit<TransformationSettings, "persona">[K]
  ) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OptionSelect
          label="Style vestimentaire"
          value={settings.outfitStyle}
          options={OUTFIT_STYLES}
          onChange={(v) => set("outfitStyle", v)}
        />
        <OptionSelect
          label="Coiffure"
          value={settings.hairStyle}
          options={HAIR_STYLES}
          onChange={(v) => set("hairStyle", v)}
        />
        <OptionSelect
          label="Couleurs"
          value={settings.colorPalette}
          options={COLOR_PALETTES}
          onChange={(v) => set("colorPalette", v)}
        />
        <OptionSelect
          label="Arrière-plan"
          value={settings.background}
          options={BACKGROUNDS}
          onChange={(v) => set("background", v)}
        />
        <OptionSelect
          label="Éclairage"
          value={settings.lighting}
          options={LIGHTING_OPTIONS}
          onChange={(v) => set("lighting", v)}
        />
        <OptionSelect
          label="Expression"
          value={settings.expression}
          options={EXPRESSIONS}
          onChange={(v) => set("expression", v)}
        />
        <OptionSelect
          label="Posture"
          value={settings.posture}
          options={POSTURES}
          onChange={(v) => set("posture", v)}
        />
        <OptionSelect
          label="Caméra"
          value={settings.cameraAngle}
          options={CAMERA_ANGLES}
          onChange={(v) => set("cameraAngle", v)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Label>Énergie ({settings.energyLevel ?? 50}%)</Label>
          <Slider
            aria-label="Niveau d'énergie"
            value={[settings.energyLevel ?? 50]}
            onValueChange={(v) => set("energyLevel", Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Niveau de sourire ({settings.smileLevel ?? 50}%)</Label>
          <Slider
            aria-label="Niveau de sourire"
            value={[settings.smileLevel ?? 50]}
            onValueChange={(v) => set("smileLevel", Array.isArray(v) ? v[0] : v)}
          />
        </div>
      </div>

      <div className="flex max-w-xs flex-col gap-2">
        <Label htmlFor={qualityId}>Qualité</Label>
        <Select
          value={settings.quality}
          onValueChange={(v) => v && set("quality", v as TransformationSettings["quality"])}
        >
          <SelectTrigger id={qualityId} className="w-full">
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            {QUALITY_LEVELS.map((q) => (
              <SelectItem key={q.value} value={q.value}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
