import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAvatarTemplateById } from "@/lib/avatar-templates";
import { readJson } from "@/lib/http";

interface FromTemplateBody {
  templateId: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await readJson<FromTemplateBody>(request);
  const template = body?.templateId ? getAvatarTemplateById(body.templateId) : undefined;

  if (!template) {
    return NextResponse.json({ error: "Avatar introuvable." }, { status: 400 });
  }

  const { data: character, error: insertError } = await supabase
    .from("ai_characters")
    .insert({
      user_id: user.id,
      name: template.name,
      description: template.description,
      reference_image_url: template.imageUrl,
    })
    .select()
    .single();

  if (insertError || !character) {
    return NextResponse.json(
      { error: insertError?.message ?? "Échec de création." },
      { status: 500 }
    );
  }

  await supabase.from("character_images").insert({
    character_id: character.id,
    user_id: user.id,
    prompt: template.description,
    is_reference: true,
    provider: "fal",
    status: "completed",
    image_url: template.imageUrl,
    credits_spent: 0,
  });

  return NextResponse.json({ character });
}
