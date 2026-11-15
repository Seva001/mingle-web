import type { ProfilePhoto } from "@/lib/profile/types";

export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 900;

export type PhotoResult = { ok: true; photo: ProfilePhoto } | { ok: false; error: string };

/**
 * Validates the file, then redraws it onto a canvas and re-encodes as JPEG. Re-encoding drops
 * EXIF metadata (including GPS location) and shrinks the image. Browser-only. In the real app
 * the same checks must also run on the server before anything is stored (brief §14).
 */
export async function processPhoto(file: File): Promise<PhotoResult> {
  if (!(ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: "Use a JPEG, PNG or WebP photo." };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { ok: false, error: "That photo is larger than 15 MB. Choose a smaller one." };
  }
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return { ok: false, error: "Your browser couldn’t process that photo." };
    }
    context.fillStyle = "#ffffff"; // transparent PNGs would otherwise turn black in JPEG
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return {
      ok: true,
      photo: { id: crypto.randomUUID(), dataUrl: canvas.toDataURL("image/jpeg", 0.82) },
    };
  } catch {
    return { ok: false, error: "We couldn’t read that image. Try a different photo." };
  }
}
