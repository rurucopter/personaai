import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTransformationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer une transformation
        </h1>
        <p className="text-muted-foreground">
          Import, choix du persona, personnalisation puis génération.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bientôt disponible</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Le flux de création (upload, sélection de persona, réglages, génération
          avec suivi de progression) est prévu pour la prochaine phase.
        </CardContent>
      </Card>
    </div>
  );
}
