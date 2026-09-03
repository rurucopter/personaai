"use client";

import { getAvatarTemplateById } from "@/lib/avatar-templates";
import { cn } from "@/lib/utils";

const PIXAR_PERSONA_ID = "pixar-3d";
const FRUIT_TEMPLATE_ID = "talking-banana";
const FRUIT_PERSONA_ID = `template:${FRUIT_TEMPLATE_ID}`;

interface PersonaStepProps {
  selected: string | null;
  onSelect: (personaId: string) => void;
}

export function PersonaStep({ selected, onSelect }: PersonaStepProps) {
  const fruitTemplate = getAvatarTemplateById(FRUIT_TEMPLATE_ID);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">Choisissez un style</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect(PIXAR_PERSONA_ID)}
          className={cn(
            "flex flex-col gap-3 rounded-xl border p-6 text-left transition-colors",
            selected === PIXAR_PERSONA_ID
              ? "border-primary bg-secondary/60"
              : "border-border hover:bg-secondary/30"
          )}
        >
          <span className="text-3xl">🎬</span>
          <div>
            <p className="font-medium">Vidéo 3D Pixar</p>
            <p className="text-sm text-muted-foreground">
              Transformez votre vidéo en personnage animé 3D façon film Pixar.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect(FRUIT_PERSONA_ID)}
          className={cn(
            "flex flex-col gap-3 rounded-xl border p-6 text-left transition-colors",
            selected === FRUIT_PERSONA_ID
              ? "border-primary bg-secondary/60"
              : "border-border hover:bg-secondary/30"
          )}
        >
          {fruitTemplate ? (
            <div className="size-12 overflow-hidden rounded-lg bg-secondary/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fruitTemplate.imageUrl}
                alt="Fruits qui parlent"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <span className="text-3xl">🍌</span>
          )}
          <div>
            <p className="font-medium">Fruits qui parlent</p>
            <p className="text-sm text-muted-foreground">
              La personne dans la vidéo devient un fruit rigolo qui parle.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
