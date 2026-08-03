import { createClient } from "@/lib/supabase/server";
import { CreationWizard } from "@/components/create/creation-wizard";
import type { CharacterRow, CreditsRow } from "@/types/database";

export default async function CreateTransformationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: credits }, { data: characters }] = await Promise.all([
    supabase.from("credits").select("*").eq("user_id", user!.id).single<CreditsRow>(),
    supabase
      .from("ai_characters")
      .select("*")
      .eq("user_id", user!.id)
      .not("reference_image_url", "is", null)
      .returns<CharacterRow[]>(),
  ]);

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

      <CreationWizard creditBalance={credits?.balance ?? 0} characters={characters ?? []} />
    </div>
  );
}
