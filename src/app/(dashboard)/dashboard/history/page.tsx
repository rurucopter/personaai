import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { getPersonaById } from "@/lib/personas";
import type { HistoryRow } from "@/types/database";

const ACTION_LABEL: Record<HistoryRow["action"], string> = {
  upload: "Import",
  generate: "Génération",
  download: "Téléchargement",
  delete: "Suppression",
  duplicate: "Duplication",
  favorite: "Ajout aux favoris",
  unfavorite: "Retrait des favoris",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = await supabase
    .from("history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<HistoryRow[]>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historique</h1>
        <p className="text-muted-foreground">
          Journal de vos actions : imports, générations, téléchargements.
        </p>
      </div>

      {history && history.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {history.map((entry) => {
            const personaId = (entry.metadata as { persona?: string })?.persona;
            const persona = personaId ? getPersonaById(personaId) : undefined;

            return (
              <div key={entry.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{ACTION_LABEL[entry.action]}</Badge>
                  {persona && (
                    <span className="text-sm text-muted-foreground">{persona.label}</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString("fr-FR")}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun historique pour le moment.</p>
      )}
    </div>
  );
}
