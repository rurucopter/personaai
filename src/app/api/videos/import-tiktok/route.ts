import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { downloadVideoFromUrl } from "@/lib/tiktok-import";
import {
  grabFrameServer,
  probeVideo,
  trimVideoServer,
  upscaleVideoServer,
} from "@/lib/video-server-utils";
import {
  MAX_SOURCE_SECONDS,
  MAX_UPLOAD_SIZE_BYTES,
  MIN_SOURCE_SECONDS,
  MIN_SOURCE_WIDTH_PX,
} from "@/lib/upload-constraints";

interface ImportTikTokBody {
  url: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = (await request.json()) as ImportTikTokBody;
  if (!body.url?.trim()) {
    return NextResponse.json({ error: "Lien manquant." }, { status: 400 });
  }

  let video: Buffer;
  try {
    video = await downloadVideoFromUrl(body.url.trim());
  } catch (err) {
    console.error("TikTok import failed:", err);
    return NextResponse.json(
      {
        error:
          "Impossible de télécharger cette vidéo. Vérifiez que le lien est correct et que la vidéo est publique.",
      },
      { status: 422 }
    );
  }

  if (video.byteLength > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Vidéo trop volumineuse (${(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0)} Mo maximum).` },
      { status: 422 }
    );
  }

  const meta = await probeVideo(video);

  if (meta.durationSeconds < MIN_SOURCE_SECONDS) {
    return NextResponse.json(
      {
        error: `Durée non supportée (${meta.durationSeconds.toFixed(1)}s). Il faut une vidéo de ${MIN_SOURCE_SECONDS} à ${MAX_SOURCE_SECONDS} secondes.`,
      },
      { status: 422 }
    );
  }

  let finalVideo = video;
  let durationSeconds = meta.durationSeconds;
  let { width, height } = meta;

  // TikTok clips routinely run a bit past the active provider's max —
  // trim to fit instead of rejecting the import outright.
  if (durationSeconds > MAX_SOURCE_SECONDS) {
    try {
      finalVideo = await trimVideoServer(finalVideo, MAX_SOURCE_SECONDS);
      const trimmedMeta = await probeVideo(finalVideo);
      durationSeconds = trimmedMeta.durationSeconds;
      width = trimmedMeta.width;
      height = trimmedMeta.height;
    } catch {
      return NextResponse.json(
        { error: "Impossible d'ajuster automatiquement la durée de cette vidéo." },
        { status: 422 }
      );
    }
  }

  if (Math.min(width, height) < MIN_SOURCE_WIDTH_PX) {
    try {
      finalVideo = await upscaleVideoServer(finalVideo, MIN_SOURCE_WIDTH_PX);
      const upscaledMeta = await probeVideo(finalVideo);
      width = upscaledMeta.width;
      height = upscaledMeta.height;
    } catch {
      return NextResponse.json(
        { error: "Résolution trop faible et impossible à améliorer automatiquement." },
        { status: 422 }
      );
    }

    if (finalVideo.byteLength > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La vidéo est trop volumineuse une fois mise à niveau en résolution." },
        { status: 422 }
      );
    }
  }

  const timestamp = Date.now();
  const videoPath = `${user.id}/${timestamp}-tiktok.mp4`;

  const { error: videoUploadError } = await supabase.storage
    .from("source-videos")
    .upload(videoPath, finalVideo, { contentType: "video/mp4" });

  if (videoUploadError) {
    return NextResponse.json({ error: videoUploadError.message }, { status: 500 });
  }

  let referenceFramePath: string | null = null;
  try {
    const frame = await grabFrameServer(finalVideo, durationSeconds / 2);
    const framePath = `${user.id}/${timestamp}-frame.jpg`;
    const { error: frameUploadError } = await supabase.storage
      .from("video-frames")
      .upload(framePath, frame, { contentType: "image/jpeg" });
    if (!frameUploadError) referenceFramePath = framePath;
  } catch {
    // Best-effort — generation still works from the video alone.
  }

  const { data: signedUrlData } = await supabase.storage
    .from("source-videos")
    .createSignedUrl(videoPath, 60 * 60);

  return NextResponse.json({
    path: videoPath,
    durationSeconds,
    width,
    height,
    referenceFramePath,
    previewUrl: signedUrlData?.signedUrl ?? null,
  });
}
