import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  const { data: video, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !video) {
    return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
  }

  return NextResponse.json({ video });
}

export async function DELETE(
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

  const { data: video } = await supabase
    .from("videos")
    .select("source_video_url, result_video_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!video) {
    return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from("videos").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (video.source_video_url) {
    await supabase.storage.from("source-videos").remove([video.source_video_url]);
  }
  // Result videos are re-hosted at `${videoId}.mp4` (see postprocessResultVideo);
  // `result_video_url` is the full public URL, not the object path, so we derive
  // the path here — passing the URL would never match and orphan the file.
  if (video.result_video_url) {
    await supabase.storage.from("result-videos").remove([`${id}.mp4`]);
  }

  await supabase.from("history").insert({
    user_id: user.id,
    video_id: null,
    action: "delete",
    metadata: { video_id: id },
  });

  return NextResponse.json({ success: true });
}
