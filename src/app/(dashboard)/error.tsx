"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 p-10 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <div>
        <p className="font-medium">Une erreur est survenue</p>
        <p className="text-sm text-muted-foreground">
          Impossible de charger cette page pour le moment.
        </p>
      </div>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
