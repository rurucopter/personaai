import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Adaptive grain: adds noticeably more grain to already-smooth regions
// (the over-airbrushed skin AI models produce) and much less to areas that
// already have real detail (hair, edges, background) — avoids the "grain
// smeared uniformly over everything, including things that were already
// textured" look of a flat noise filter, and avoids graining texture-y
// background objects (e.g. a wood-toned wall) that a naive skin-color mask
// would misfire on. Built from local-detail (blur-difference) analysis,
// not face detection, so it works on any framing.
const ADAPTIVE_GRAIN_FILTER =
  "[0:v]format=rgb24,split=4[orig1][orig2][orig3][orig4];" +
  "[orig1]gblur=sigma=10[blurred];" +
  "[orig2][blurred]blend=all_mode=difference,format=gray,eq=contrast=8:brightness=0.25,negate[smoothmask];" +
  "[orig3]noise=alls=45:allf=t+u[noisy];" +
  "[orig4][noisy][smoothmask]maskedmerge,eq=contrast=1.02:saturation=0.98[out]";

/**
 * Overlays film grain/noise on a generated video, concentrated on smooth
 * (skin-like) regions. AI video models consistently over-smooth skin no
 * matter how the prompt is worded — that's a model bias, not something text
 * can fully override. This is the one reliable fix: it doesn't depend on
 * the model's behavior at all, since it runs on the output afterward.
 */
export async function addFilmGrain(videoBuffer: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-grain-"));
  const inputPath = join(dir, "input.mp4");
  const outputPath = join(dir, "output.mp4");

  try {
    await writeFile(inputPath, videoBuffer);

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, [
        "-y",
        "-i",
        inputPath,
        "-filter_complex",
        ADAPTIVE_GRAIN_FILTER,
        "-map",
        "[out]",
        "-map",
        "0:a?",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-c:a",
        "copy",
        outputPath,
      ]);

      let stderr = "";
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
      });
    });

    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Merges a TTS voice-over audio track into a video file using ffmpeg.
 * The audio is trimmed/padded to match the video duration. Any existing
 * audio in the video is replaced.
 */
export async function mergeVoiceover(
  videoBuffer: Buffer,
  audioBuffer: Buffer
): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-vo-"));
  const videoPath = join(dir, "video.mp4");
  const audioPath = join(dir, "voiceover.wav");
  const outputPath = join(dir, "merged.mp4");

  try {
    await writeFile(videoPath, videoBuffer);
    await writeFile(audioPath, audioBuffer);

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, [
        "-y",
        "-i", videoPath,
        "-i", audioPath,
        "-filter_complex",
        "[1:a]apad[vo];[0:a][vo]amix=inputs=2:duration=first:dropout_transition=0[aout]",
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        outputPath,
      ]);

      let stderr = "";
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg merge failed (code ${code}): ${stderr.slice(-500)}`));
      });
    });

    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Simpler fallback: replaces any existing audio with the TTS track.
 * Used when the source video has no audio stream to mix with.
 */
async function replaceAudio(
  videoBuffer: Buffer,
  audioBuffer: Buffer
): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-vo-"));
  const videoPath = join(dir, "video.mp4");
  const audioPath = join(dir, "voiceover.wav");
  const outputPath = join(dir, "merged.mp4");

  try {
    await writeFile(videoPath, videoBuffer);
    await writeFile(audioPath, audioBuffer);

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, [
        "-y",
        "-i", videoPath,
        "-i", audioPath,
        "-map", "0:v",
        "-map", "1:a",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        outputPath,
      ]);

      let stderr = "";
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg replace-audio failed (code ${code}): ${stderr.slice(-500)}`));
      });
    });

    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Downloads the provider's result video, adds film grain, optionally merges
 * a French voice-over, and re-hosts it in our own "result-videos" bucket.
 * Returns the new public URL, or the original URL unchanged if anything in
 * the pipeline fails — post-processing is a quality enhancement, not
 * something that should ever block a completed generation from reaching
 * the user.
 */
export async function postprocessResultVideo(
  providerVideoUrl: string,
  videoId: string,
  voiceoverAudio?: Buffer
): Promise<string> {
  try {
    const res = await fetch(providerVideoUrl);
    if (!res.ok) throw new Error(`Failed to download result: ${res.status}`);

    const original = Buffer.from(await res.arrayBuffer());
    const grainy = await addFilmGrain(original);

    const final = voiceoverAudio
      ? await replaceAudio(grainy, voiceoverAudio).catch((err) => {
          console.error("Voice-over merge failed, using video without VO:", err);
          return grainy;
        })
      : grainy;

    const supabase = createServiceRoleClient();
    const path = `${videoId}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from("result-videos")
      .upload(path, final, { contentType: "video/mp4", upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("result-videos").getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error("Post-processing failed, using original video:", err);
    return providerVideoUrl;
  }
}
