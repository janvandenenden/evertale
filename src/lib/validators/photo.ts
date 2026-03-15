const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePhotoFile(file: File): PhotoValidationResult {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Please upload a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File must be under 10MB.",
    };
  }

  return { valid: true };
}

export function validatePhotoMetadata(
  fileType: string,
  fileSize: number
): PhotoValidationResult {
  if (!ALLOWED_TYPES.has(fileType)) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload a JPEG, PNG, or WebP image.",
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File must be under 10MB.",
    };
  }

  return { valid: true };
}
