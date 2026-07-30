"use client";

import {
  BACKGROUNDS,
  CAMERA_ANGLES,
  COLOR_PALETTES,
  DURATION_OPTIONS,
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
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="w-full">
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
            value={[settings.energyLevel ?? 50]}
            onValueChange={(v) => set("energyLevel", Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Niveau de sourire ({settings.smileLevel ?? 50}%)</Label>
          <Slider
            value={[settings.smileLevel ?? 50]}
            onValueChange={(v) => set("smileLevel", Array.isArray(v) ? v[0] : v)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Qualité</Label>
          <Select
            value={settings.quality}
            onValueChange={(v) => v && set("quality", v as TransformationSettings["quality"])}
          >
            <SelectTrigger className="w-full">
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
        <div className="flex flex-col gap-2">
          <Label>Durée</Label>
          <Select
            value={settings.durationSeconds?.toString()}
            onValueChange={(v) => v && set("durationSeconds", Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((d) => (
                <SelectItem key={d} value={d.toString()}>
                  {d} secondes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
