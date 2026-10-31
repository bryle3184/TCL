import { ApiError } from "@/lib/api";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

/**
 * Vercel has no writable persistent disk, so uploads are stored as data URLs
 * inside MongoDB Atlas alongside the record that owns them.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new ApiError("Upload a PNG, JPG, WEBP or GIF image.", 415);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError("Images must be 2 MB or smaller.", 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export function isUpload(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export function readText(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}
