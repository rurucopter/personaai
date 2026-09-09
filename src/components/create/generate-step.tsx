"use client";

import Link from "next/link";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPersonaById } from "@/lib/personas";
import { getAvatarTemplateById } from "@/lib/avatar-templates";

interface GenerateStepProps {
  personaId: string;
  cost: number;
  creditBalance: number;
  submitting: boolean;
  error: string | null;
  onGenerate: () => void;
}

export function GenerateStep({
  personaId,
  cost,
  creditBalance,
  submitting,
  error,
  onGenerate,
}: GenerateStepProps) {
  const template = personaId.startsWith("template:")
    ? getAvatarTemplateById(personaId.slice("template:".length))
    : undefined;
  const persona = template ? undefined : getPersonaById(personaId);
  const label = template?.name ?? persona?.label;
  const insufficientCredits = creditBalance < cost;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border p-6">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Récapitulatif</p>
        <Badge variant="secondary">{label}</Badge>
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
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 transition-colors hover:bg-destructive/15"
        >
          <AlertTriangle className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Crédits insuffisants
            </p>
            <p className="text-xs text-destructive/80">
              Vous avez {creditBalance} crédit{creditBalance !== 1 ? "s" : ""}, il en faut {cost}. Changez de forfait pour continuer.
            </p>
          </div>
        </Link>
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
