const MAX_BYTES = 4.5 * 1024 * 1024;
const MAX_DIMENSION = 2048;

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Échec de conversion de l'image."))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * Normalizes any browser-decodable image (PNG, GIF, BMP, WebP, AVIF, and —
 * via heic2any — an iPhone's default HEIC/HEIF) into a JPEG blob. Storage
 * and the AI provider only need to deal with one predictable format,
 * regardless of what a user's phone or camera actually produced.
 */
export async function normalizeImageToJpeg(file: File): Promise<Blob> {
  const isHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  let source: Blob = file;
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    source = Array.isArray(converted) ? converted[0] : converted;
  }

  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de traiter cette image.");
  // Flatten on white first — a transparent PNG/WebP would otherwise turn
  // black once forced into JPEG (no alpha channel).
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.92;
  let blob = await canvasToJpegBlob(canvas, quality);
  while (blob.size > MAX_BYTES && quality > 0.4) {
    quality -= 0.15;
    blob = await canvasToJpegBlob(canvas, quality);
  }
  return blob;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
