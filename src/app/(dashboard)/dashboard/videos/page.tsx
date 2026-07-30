import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VideosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes vidéos</h1>
        <p className="text-muted-foreground">
          Retrouvez toutes vos transformations générées.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aucune vidéo pour le moment</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          La galerie avec recherche et filtres (date, style, durée, favoris)
          arrive dans une prochaine phase.
        </CardContent>
      </Card>
    </div>
  );
}
