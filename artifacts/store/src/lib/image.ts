/**
 * Resize an image file to a max dimension and return a base64 data URL.
 * Keeps localStorage usage low.
 */
export async function fileToResizedDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.82,
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);

  const mime = file.type.includes("png") ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
