/** Format duration in seconds to a human readable string (e.g., "01:23" or "01:02:03") */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/** Format file size in bytes to a human readable string (e.g., "1.5 MB") */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Check if a content type is a video MIME type */
export function isVideoContentType(contentType: string): boolean {
  return contentType.startsWith("video/");
}

/** Check if a content type is an image MIME type */
export function isImageContentType(contentType: string): boolean {
  return contentType.startsWith("image/");
}

/**
 * Get the best available preview URL for a media asset.
 * Priority: preview thumbnail > video thumbnail > original URL
 */
export function getAssetPreviewUrl(asset: {
  preview?: string;
  thumbnail?: { url?: string };
  url?: string;
}): string | undefined {
  return asset.preview ?? asset.thumbnail?.url ?? asset.url;
}
