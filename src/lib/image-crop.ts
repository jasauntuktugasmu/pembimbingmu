// Center-crop helper. Loads an image (File or URL), cuts the largest centered
// rectangle that matches the requested aspect, then resizes to maxWidth.
// Returns a JPEG Blob.

export interface CropOptions {
  aspect: number; // e.g. 16/9
  maxWidth?: number; // output width in px
  quality?: number; // 0..1
  mime?: "image/jpeg" | "image/webp" | "image/png";
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export async function cropImageCenter(
  source: File | string,
  opts: CropOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const srcUrl = typeof source === "string" ? source : await fileToDataUrl(source);
  const img = await loadImage(srcUrl);

  const { aspect, maxWidth = 1600, quality = 0.88, mime = "image/jpeg" } = opts;

  // Compute the largest centered rectangle inside the image with target aspect.
  const srcAspect = img.width / img.height;
  let sw: number, sh: number, sx: number, sy: number;
  if (srcAspect > aspect) {
    // image is wider — crop sides
    sh = img.height;
    sw = Math.round(sh * aspect);
    sx = Math.round((img.width - sw) / 2);
    sy = 0;
  } else {
    sw = img.width;
    sh = Math.round(sw / aspect);
    sx = 0;
    sy = Math.round((img.height - sh) / 2);
  }

  const targetW = Math.min(maxWidth, sw);
  const targetH = Math.round(targetW / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), mime, quality);
  });
  const dataUrl = canvas.toDataURL(mime, quality);
  return { blob, dataUrl, width: targetW, height: targetH };
}

export interface CropTemplate {
  id: string;
  label: string;
  aspect: number; // width/height
  recommended: string; // human readable
  maxWidth: number;
  hint?: string;
}

export const FEATURED_TEMPLATES: CropTemplate[] = [
  { id: "16x9", label: "Hero 16:9", aspect: 16 / 9, maxWidth: 1600, recommended: "1600 × 900 px", hint: "Direkomendasikan — pas untuk thumbnail blog, OG image & tampilan halaman artikel" },
  { id: "21x9", label: "Ultrawide 21:9", aspect: 21 / 9, maxWidth: 1680, recommended: "1680 × 720 px", hint: "Gaya banner sinematik seperti hero blog modern" },
  { id: "4x3", label: "Klasik 4:3", aspect: 4 / 3, maxWidth: 1600, recommended: "1600 × 1200 px", hint: "Cocok untuk foto / ilustrasi" },
  { id: "1x1", label: "Persegi 1:1", aspect: 1, maxWidth: 1200, recommended: "1200 × 1200 px", hint: "Bagus untuk feed sosial media" },
  { id: "3x2", label: "Foto 3:2", aspect: 3 / 2, maxWidth: 1500, recommended: "1500 × 1000 px", hint: "Rasio standar kamera" },
];

export const CONTENT_TEMPLATES: CropTemplate[] = [
  { id: "16x9", label: "Hero 16:9", aspect: 16 / 9, maxWidth: 1200, recommended: "1200 × 675 px", hint: "Direkomendasikan — bentuk landscape khas hero artikel" },
  { id: "21x9", label: "Ultrawide 21:9", aspect: 21 / 9, maxWidth: 1400, recommended: "1400 × 600 px", hint: "Gaya banner sinematik" },
  { id: "4x3", label: "Klasik 4:3", aspect: 4 / 3, maxWidth: 1200, recommended: "1200 × 900 px" },
  { id: "1x1", label: "Persegi 1:1", aspect: 1, maxWidth: 900, recommended: "900 × 900 px" },
  { id: "3x2", label: "Foto 3:2", aspect: 3 / 2, maxWidth: 1200, recommended: "1200 × 800 px" },
  { id: "original", label: "Asli (tanpa crop)", aspect: 0, maxWidth: 1600, recommended: "Pakai gambar apa adanya" },
];

export const blobToFile = (blob: Blob, name: string): File =>
  new File([blob], name, { type: blob.type });
