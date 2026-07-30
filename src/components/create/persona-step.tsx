"use client";

import { PERSONA_CATEGORIES, getPersonasByCategory } from "@/lib/personas";
import { cn } from "@/lib/utils";

interface PersonaStepProps {
  selected: string | null;
  onSelect: (personaId: string) => void;
}

export function PersonaStep({ selected, onSelect }: PersonaStepProps) {
  return (
    <div className="flex flex-col gap-8">
      {PERSONA_CATEGORIES.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {getPersonasByCategory(category).map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => onSelect(persona.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors",
                  selected === persona.id
                    ? "border-primary bg-secondary/60"
                    : "border-border hover:bg-secondary/30"
                )}
              >
                <span className="font-medium">{persona.label}</span>
                <span className="text-xs text-muted-foreground">
                  {persona.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
