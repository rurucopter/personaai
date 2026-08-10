import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Accès restreint" };

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-32 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Lock className="size-6" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Accès restreint</h1>
        <p className="text-muted-foreground">
          Persona<span className="text-brand">AI</span> est actuellement en
          usage privé et n&apos;est pas encore ouvert aux inscriptions
          publiques.
        </p>
      </div>
      <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
        Retour à l&apos;accueil
      </Button>
    </div>
  );
}
