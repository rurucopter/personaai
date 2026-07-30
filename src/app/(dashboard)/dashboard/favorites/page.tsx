import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Favoris</h1>
        <p className="text-muted-foreground">
          Vos transformations préférées, à portée de main.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aucun favori pour le moment</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ajoutez des vidéos à vos favoris depuis la galerie.
        </CardContent>
      </Card>
    </div>
  );
}
