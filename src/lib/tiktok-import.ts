import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const YT_DLP_PATH = join(process.cwd(), "bin", "yt-dlp.exe");

/**
 * Only TikTok hosts are accepted — otherwise a user could hand us an
 * arbitrary URL (internal address, non-TikTok host) and turn this into an
 * SSRF/download-anything primitive via yt-dlp. yt-dlp's own follow-on fetches
 * go to TikTok-owned CDNs, so gating the *input* host is the mitigation.
 */
export function isAllowedTikTokUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase();
  return host === "tiktok.com" || host.endsWith(".tiktok.com");
}

/**
 * Downloads a TikTok (or any yt-dlp-supported) video by URL and returns it
 * as a buffer. For the user's own personal use — importing a video they
 * want to run through the transformation pipeline, same as uploading a
 * file directly.
 */
export async function downloadVideoFromUrl(url: string): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), "personaai-tiktok-"));
  const outputTemplate = join(dir, "video.%(ext)s");

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(YT_DLP_PATH, [
        url,
        "-f",
        "mp4/best",
        "--recode-video",
        "mp4",
        "--no-playlist",
        "--max-filesize",
        "200M",
        "-o",
        outputTemplate,
      ]);

      let stderr = "";
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`yt-dlp exited with code ${code}: ${stderr.slice(-800)}`));
      });
    });

    const outputPath = join(dir, "video.mp4");
    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
