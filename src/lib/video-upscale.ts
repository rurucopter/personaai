import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: "/ffmpeg/ffmpeg-core.js",
    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

/**
 * Upscales a video so its shortest side reaches `minShortSide`, preserving
 * aspect ratio and re-encoding to mp4 (h264/aac). Runs entirely client-side
 * via ffmpeg.wasm — no server round-trip needed.
 */
export async function upscaleVideo(
  file: File,
  minShortSide: number,
  onProgress?: (ratio: number) => void
): Promise<File> {
  const ffmpeg = await getFFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => onProgress(Math.min(1, Math.max(0, progress))));
  }

  const inputName = "input" + (file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? ".mov");
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // scale so the shorter side == minShortSide, keep aspect ratio, force even dimensions
  const scaleFilter = `scale='if(gt(a,1),-2,${minShortSide})':'if(gt(a,1),${minShortSide},-2)'`;

  await ffmpeg.exec([
    "-i",
    inputName,
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
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  const bytes = data as Uint8Array;

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  return new File([arrayBuffer], file.name.replace(/\.[a-zA-Z0-9]+$/, ".mp4"), {
    type: "video/mp4",
  });
}
