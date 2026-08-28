"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPersonaById } from "@/lib/personas";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import type { TransformationSettings } from "@/types/ai-provider";
import type { CharacterRow } from "@/types/database";

interface GenerateStepProps {
  personaId: string;
  settings: Omit<TransformationSettings, "persona">;
  cost: number;
  creditBalance: number;
  submitting: boolean;
  error: string | null;
  onGenerate: () => void;
  characters: CharacterRow[];
}

export function GenerateStep({
  personaId,
  settings,
  cost,
  creditBalance,
  submitting,
  error,
  onGenerate,
  characters,
}: GenerateStepProps) {
  const character = personaId.startsWith("character:")
    ? characters.find((c) => `character:${c.id}` === personaId)
    : undefined;
  const template = personaId.startsWith("template:")
    ? getAvatarTemplateById(personaId.slice("template:".length))
    : undefined;
  const isCustomPhoto = personaId.startsWith("photo:");
  const persona = character || template || isCustomPhoto ? undefined : getPersonaById(personaId);
  const label = character?.name ?? template?.name ?? (isCustomPhoto ? "Photo importée" : persona?.label);
  const insufficientCredits = creditBalance < cost;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border p-6">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Récapitulatif</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{label}</Badge>
          {settings.outfitStyle && <Badge variant="secondary">{settings.outfitStyle}</Badge>}
          {settings.background && <Badge variant="secondary">{settings.background}</Badge>}
          {settings.quality && <Badge variant="secondary">Qualité {settings.quality}</Badge>}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border p-6">
        <div>
          <p className="font-medium">Coût de la génération</p>
          <p className="text-sm text-muted-foreground">
            Solde actuel : {creditBalance} crédits
          </p>
        </div>
        <Badge className="text-base">{cost} crédits</Badge>
      </div>

      {insufficientCredits && (
        <p className="text-sm text-destructive">
          Crédits insuffisants pour cette génération.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="lg"
        className="gap-2 self-start"
        disabled={submitting || insufficientCredits}
        onClick={onGenerate}
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        Générer
      </Button>
    </div>
  );
}
