"use client";

import { PERSONA_CATEGORIES, getPersonasByCategory } from "@/lib/personas";
import { AVATAR_TEMPLATES } from "@/lib/avatar-templates";
import { cn } from "@/lib/utils";
import type { CharacterRow } from "@/types/database";

interface PersonaStepProps {
  selected: string | null;
  onSelect: (personaId: string) => void;
  characters: CharacterRow[];
}

export function PersonaStep({ selected, onSelect, characters }: PersonaStepProps) {
  return (
    <div className="flex flex-col gap-8">
      {characters.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">Mes personnages IA</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {characters.map((character) => {
              const id = `character:${character.id}`;
              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                    selected === id
                      ? "border-primary bg-secondary/60"
                      : "border-border hover:bg-secondary/30"
                  )}
                >
                  <div className="aspect-square overflow-hidden bg-secondary/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={character.reference_image_url!}
                      alt={character.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <span className="font-medium">{character.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Avatars IA — devenez cette personne
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AVATAR_TEMPLATES.map((template) => {
            const id = `template:${template.id}`;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(id)}
                className={cn(
                  "flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                  selected === id
                    ? "border-primary bg-secondary/60"
                    : "border-border hover:bg-secondary/30"
                )}
              >
                <div className="aspect-square overflow-hidden bg-secondary/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <span className="font-medium">{template.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
