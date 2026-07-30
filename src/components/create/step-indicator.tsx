import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = ["Importer", "Persona", "Personnaliser", "Générer"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                done && "bg-primary text-primary-foreground",
                active && "border-2 border-primary text-primary",
                !done && !active && "border border-border text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3.5" /> : stepNumber}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {stepNumber < STEPS.length && (
              <div className="mx-2 h-px flex-1 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
