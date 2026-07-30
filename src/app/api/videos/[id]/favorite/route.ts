import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("video_id")
    .eq("user_id", user.id)
    .eq("video_id", id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("video_id", id);
    await supabase
      .from("history")
      .insert({ user_id: user.id, video_id: id, action: "unfavorite" });
    return NextResponse.json({ favorited: false });
  }

  await supabase.from("favorites").insert({ user_id: user.id, video_id: id });
  await supabase.from("history").insert({ user_id: user.id, video_id: id, action: "favorite" });

  return NextResponse.json({ favorited: true });
}
