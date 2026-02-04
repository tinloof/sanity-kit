/**
 * Extract metadata from image files
 */
export async function extractImageMetadata(file: File) {
  return new Promise<{
    width: number;
    height: number;
    hasAlpha?: boolean;
    isOpaque?: boolean;
    lqip?: string;
  }>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const lqip = await generateLQIP(img);
      const hasAlpha = await detectAlphaChannel(img);

      URL.revokeObjectURL(objectUrl);
      resolve({
        width,
        height,
        hasAlpha,
        isOpaque: !hasAlpha,
        lqip,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: 0, height: 0 });
    };

    img.src = objectUrl;
  });
}

/**
 * Extract metadata from video files and generate thumbnail
 */
export async function extractVideoMetadata(file: File) {
  return new Promise<{
    width: number;
    height: number;
    duration: number;
    hasAudio: boolean;
    thumbnailBlob: Blob;
  }>((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;
      const seekTime = Math.min(1, duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = async () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detect if video has audio tracks
        const hasAudio = detectAudioTracks(video);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error("Failed to generate thumbnail"));
              return;
            }

            resolve({
              width: video.videoWidth,
              height: video.videoHeight,
              duration: video.duration,
              hasAudio,
              thumbnailBlob: blob,
            });
          },
          "image/jpeg",
          0.85,
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video"));
    };

    video.src = objectUrl;
  });
}

/**
 * Detect if video has audio tracks
 */
function detectAudioTracks(video: HTMLVideoElement): boolean {
  // Check if the video has any audio tracks using the HTMLMediaElement API
  // @ts-expect-error - mozHasAudio is Firefox-specific
  if (typeof video.mozHasAudio !== "undefined") {
    // @ts-expect-error - mozHasAudio is Firefox-specific
    return video.mozHasAudio;
  }

  // @ts-expect-error - webkitAudioDecodedByteCount is WebKit-specific
  if (typeof video.webkitAudioDecodedByteCount !== "undefined") {
    // @ts-expect-error - webkitAudioDecodedByteCount is WebKit-specific
    return video.webkitAudioDecodedByteCount > 0;
  }

  // Standard API - check if audioTracks exist
  if (video.audioTracks && video.audioTracks.length > 0) {
    return true;
  }

  // Fallback: assume video has audio if we can't detect
  // This is safer than assuming no audio
  return true;
}

/**
 * Generate a low-quality image placeholder (LQIP) for fast loading
 */
async function generateLQIP(img: HTMLImageElement): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const maxDim = 20;
  const scale = maxDim / Math.max(img.width, img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.3);
}

/**
 * Detect if image has an alpha channel
 */
async function detectAlphaChannel(img: HTMLImageElement): Promise<boolean> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }

  return false;
}
