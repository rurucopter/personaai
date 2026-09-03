import { createClient } from "@/lib/supabase/server";
import { CreationWizard } from "@/components/create/creation-wizard";
import type { CreditsRow } from "@/types/database";

export default async function CreateTransformationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user!.id)
    .single<CreditsRow>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer une transformation
        </h1>
        <p className="text-muted-foreground">
          Import, choix du style, personnalisation puis génération.
        </p>
      </div>

      <CreationWizard creditBalance={credits?.balance ?? 0} />
    </div>
  );
}
