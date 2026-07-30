import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accueil</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre espace PersonaAI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prêt à créer votre premier persona ?</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Importez une vidéo et transformez-la en quelques minutes.
          </p>
          <Button render={<Link href="/dashboard/create" />} nativeButton={false} className="gap-2">
            <Sparkles className="size-4" />
            Créer une transformation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
