"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AVATAR_TEMPLATES } from "@/lib/avatar-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AvatarPicker() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(templateId: string) {
    setError(null);
    setLoadingId(templateId);

    try {
      const res = await fetch("/api/characters/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la sélection.");
        return;
      }

      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Choisissez votre avatar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AVATAR_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handlePick(template.id)}
              disabled={loadingId !== null}
              className="group flex flex-col overflow-hidden rounded-xl border border-border text-left transition-colors hover:border-primary disabled:pointer-events-none disabled:opacity-60"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="absolute inset-0 size-full object-cover"
                />
                {loadingId === template.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="size-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
