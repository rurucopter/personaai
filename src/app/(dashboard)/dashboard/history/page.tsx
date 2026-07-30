import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historique</h1>
        <p className="text-muted-foreground">
          Journal de vos actions : imports, générations, téléchargements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aucun historique pour le moment</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Chaque action sur vos vidéos sera enregistrée ici.
        </CardContent>
      </Card>
    </div>
  );
}
