import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

export interface VideoMeta {
  width: number;
  height: number;
  durationSeconds: number;
}

/** Reads dimensions + duration of a video buffer via ffprobe. */
export async function probeVideo(videoBuffer: Buffer): Promise<VideoMeta> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-probe-"));
  const inputPath = join(dir, "input.mp4");

  try {
    await writeFile(inputPath, videoBuffer);

    const output = await new Promise<string>((resolve, reject) => {
      const proc = spawn(ffprobePath.path, [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height:format=duration",
        "-of",
        "json",
        inputPath,
      ]);

      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(`ffprobe exited with code ${code}: ${stderr.slice(-500)}`));
      });
    });

    const parsed = JSON.parse(output);
    const stream = parsed.streams?.[0] ?? {};

    return {
      width: stream.width ?? 0,
      height: stream.height ?? 0,
      durationSeconds: parseFloat(parsed.format?.duration ?? "0"),
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runFfmpeg(args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpegPath as string, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });
  });
}

/** Extracts a JPEG still frame at the given timestamp (server-side equivalent
 *  of the client's canvas-based frame grab used for identity anchoring). */
export async function grabFrameServer(videoBuffer: Buffer, atSeconds: number): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-frame-"));
  const inputPath = join(dir, "input.mp4");
  const outputPath = join(dir, "frame.jpg");

  try {
    await writeFile(inputPath, videoBuffer);
    await runFfmpeg([
      "-y",
      "-ss",
      String(Math.max(0, atSeconds)),
      "-i",
      inputPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outputPath,
    ]);
    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Upscales a video so its shortest side reaches `minShortSide` — server-side
 *  equivalent of the client's ffmpeg.wasm upscale used during file upload. */
export async function upscaleVideoServer(videoBuffer: Buffer, minShortSide: number): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-upscale-"));
  const inputPath = join(dir, "input.mp4");
  const outputPath = join(dir, "output.mp4");

  try {
    await writeFile(inputPath, videoBuffer);

    const scaleFilter = `scale='if(gt(a,1),-2,${minShortSide})':'if(gt(a,1),${minShortSide},-2)'`;

    await runFfmpeg([
      "-y",
      "-i",
      inputPath,
      "-vf",
      scaleFilter,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-c:a",
      "aac",
      outputPath,
    ]);

    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
