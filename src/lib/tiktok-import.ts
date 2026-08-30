import { spawn } from "node:child_process";
import dns from "node:dns/promises";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const YT_DLP_PATH = join(process.cwd(), "bin", "yt-dlp.exe");
const MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024;
const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

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

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
  return false;
}

async function isPrivateHostname(hostname: string): Promise<boolean> {
  if (net.isIP(hostname)) return isPrivateIp(hostname);
  try {
    const records = await dns.lookup(hostname, { all: true });
    return records.some((r) => isPrivateIp(r.address));
  } catch {
    // Can't resolve it — fail closed rather than risk following it.
    return true;
  }
}

/**
 * Fetches a URL we don't fully control (a CDN link handed back by a
 * third-party lookup service) with the same SSRF discipline as the initial
 * host allowlist: HTTPS only, and reject anything resolving to a
 * private/loopback/link-local address before we ever request it.
 */
async function fetchSafeUrl(rawUrl: string): Promise<Buffer> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("URL de téléchargement non sécurisée.");
  if (await isPrivateHostname(url.hostname)) {
    throw new Error("URL de téléchargement refusée.");
  }

  const res = await fetch(rawUrl, {
    headers: { "User-Agent": MOBILE_USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Téléchargement échoué (HTTP ${res.status}).`);

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_DOWNLOAD_BYTES) {
    throw new Error("Vidéo trop volumineuse.");
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_DOWNLOAD_BYTES) throw new Error("Vidéo trop volumineuse.");
  if (buf.byteLength === 0) throw new Error("Fichier vide reçu.");
  return buf;
}

/**
 * Primary method: yt-dlp talking to TikTok directly. Fast and gives us the
 * real (highest-quality, no watermark) source when TikTok's anti-bot layer
 * doesn't block the request.
 */
async function downloadViaYtDlp(url: string): Promise<Buffer> {
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
        "--user-agent",
        MOBILE_USER_AGENT,
        "--extractor-args",
        "tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com",
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

interface TikwmResponse {
  code: number;
  data?: { play?: string; hdplay?: string; wmplay?: string };
}

/**
 * Fallback method: a public TikTok-resolver API (no auth, widely used by
 * "save TikTok video" tools) that does its own server-side scraping and
 * hands back a direct CDN link. It gets blocked less often than a raw
 * yt-dlp request from our own server, so it's a good second attempt when
 * yt-dlp fails against TikTok's anti-bot checks.
 */
async function downloadViaTikwm(url: string): Promise<Buffer> {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
  const res = await fetch(apiUrl, {
    headers: { "User-Agent": MOBILE_USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`API de secours a répondu ${res.status}.`);

  const json = (await res.json()) as TikwmResponse;
  const playPath = json?.data?.hdplay || json?.data?.play;
  if (json.code !== 0 || !playPath) {
    throw new Error(`API de secours n'a pas retourné de vidéo (code ${json?.code}).`);
  }

  const absolute = playPath.startsWith("http") ? playPath : `https://www.tikwm.com${playPath}`;
  return await fetchSafeUrl(absolute);
}

/**
 * Downloads a TikTok video by URL and returns it as a buffer. Tries yt-dlp
 * first, then falls back to a resolver API — TikTok's anti-scraping
 * measures mean either one can fail independently on any given clip, so
 * chaining both meaningfully raises the odds a real user's link works.
 */
export async function downloadVideoFromUrl(url: string): Promise<Buffer> {
  const errors: string[] = [];

  try {
    return await downloadViaYtDlp(url);
  } catch (err) {
    errors.push(`yt-dlp: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    return await downloadViaTikwm(url);
  } catch (err) {
    errors.push(`tikwm: ${err instanceof Error ? err.message : String(err)}`);
  }

  throw new Error(errors.join(" | "));
}
