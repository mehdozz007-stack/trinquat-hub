/**
 * Cloudflare R2 Upload Utilities
 */

import { UploadError } from "./errors";

export interface UploadOptions {
  bucket: R2Bucket;
  mediaUrl: string;
  folder?: string;
  fileName?: string;
}

export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedMimes?: string[];
    allowedExtensions?: string[];
  } = {}
): void {
  const MAX_SIZE = options.maxSize || 5 * 1024 * 1024; // 5MB default
  const ALLOWED_MIMES = options.allowedMimes || [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const ALLOWED_EXT = options.allowedExtensions || ["jpg", "jpeg", "png", "webp", "gif"];

  // Check file size
  if (file.size > MAX_SIZE) {
    throw UploadError(`File size exceeds ${MAX_SIZE / 1024 / 1024}MB limit`);
  }

  // Check MIME type
  if (!ALLOWED_MIMES.includes(file.type)) {
    throw UploadError(`File type ${file.type} not allowed`);
  }

  // Check extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXT.includes(ext)) {
    throw UploadError(`File extension .${ext} not allowed`);
  }
}

/**
 * Generate safe file name
 */
export function generateFileName(
  originalName: string,
  prefix: string = ""
): string {
  const timestamp = Date.now();
  const ext = originalName.split(".").pop();
  const safeName = originalName
    .split(".")[0]
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

  return prefix ? `${prefix}-${timestamp}-${safeName}.${ext}` : `${timestamp}-${safeName}.${ext}`;
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    validateFile(file);

    const folder = options.folder || "documents";
    const fileName =
      options.fileName || generateFileName(file.name, folder);
    const key = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    
    await options.bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000",
      },
      customMetadata: {
        "original-name": file.name,
        "uploaded-at": new Date().toISOString(),
      },
    });

    // Return a local URL that works through the /uploads/* endpoint
    // This works in both development and production
    const url = `/uploads/${key}`;

    return {
      key,
      url,
      contentType: file.type,
      size: file.size,
    };
  } catch (error: any) {
    if (error.message?.includes("File")) {
      throw error; // Re-throw validation errors
    }
    throw UploadError(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  try {
    if (!key) {
      throw UploadError("No file key provided");
    }
    await bucket.delete(key);
  } catch (error: any) {
    throw UploadError(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Batch delete files from R2
 */
export async function deleteMultipleFromR2(
  bucket: R2Bucket,
  keys: string[]
): Promise<void> {
  if (!keys.length) return;

  try {
    await Promise.all(keys.map((key) => bucket.delete(key)));
  } catch (error: any) {
    throw UploadError(`Failed to delete files: ${error.message}`);
  }
}
