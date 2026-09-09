"use client";

import { AVATAR_TEMPLATES } from "@/lib/avatar-templates";
import { cn } from "@/lib/utils";

const PIXAR_PERSONA_ID = "pixar-3d";

interface PersonaStepProps {
  selected: string | null;
  onSelect: (personaId: string) => void;
}

export function PersonaStep({ selected, onSelect }: PersonaStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">Choisissez un style</h3>

      <button
        type="button"
        onClick={() => onSelect(PIXAR_PERSONA_ID)}
        className={cn(
          "flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
          selected === PIXAR_PERSONA_ID
            ? "border-primary bg-secondary/60"
            : "border-border hover:bg-secondary/30"
        )}
      >
        <span className="text-3xl">🎬</span>
        <div>
          <p className="font-medium">Vidéo 3D Pixar</p>
          <p className="text-sm text-muted-foreground">
            Personnage animé 3D façon film Pixar.
          </p>
        </div>
      </button>

      <p className="text-sm font-medium text-muted-foreground">Fruits qui parlent</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AVATAR_TEMPLATES.map((t) => {
          const personaId = `template:${t.id}`;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(personaId)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
                selected === personaId
                  ? "border-primary bg-secondary/60"
                  : "border-border hover:bg-secondary/30"
              )}
            >
              <div className="size-16 overflow-hidden rounded-lg bg-secondary/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl}
                  alt={t.name}
                  className="size-full object-cover"
                />
              </div>
              <p className="text-xs font-medium">{t.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
