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

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = async () => {
      try {
        // Safari fix: actually play the video to force frame decoding
        // The video is muted so this won't produce sound
        try {
          await video.play();
        } catch (e) {
          // Autoplay blocked, but we might still have enough data
        }
        video.pause();

        // Wait for a few animation frames to ensure the frame is painted
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );

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

        // Check for blank frame (Safari fallback)
        const isBlank = isCanvasBlank(ctx, canvas.width, canvas.height);
        if (isBlank) {
          // Try seeking to a slightly different time and retry
          video.currentTime = Math.min(2, video.duration * 0.25);
          await new Promise((r) => {
            video.onseeked = r;
          });
          try {
            await video.play();
          } catch (e) {
            // Autoplay blocked
          }
          video.pause();
          await new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          );
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Now we can detect audio (after play was called)
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
 * Check if canvas contains only black/blank pixels
 */
function isCanvasBlank(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  // Sample a few pixels to check if the frame is blank
  const samplePoints = [
    [width * 0.25, height * 0.25],
    [width * 0.5, height * 0.5],
    [width * 0.75, height * 0.75],
  ];

  for (const [x, y] of samplePoints) {
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    // Check if pixel has any non-black color (with some tolerance)
    if (pixel[0] > 5 || pixel[1] > 5 || pixel[2] > 5) {
      return false;
    }
  }
  return true;
}

/**
 * Detect if video has audio tracks
 */
function detectAudioTracks(video: HTMLVideoElement): boolean {
  // Firefox-specific
  if ("mozHasAudio" in video) {
    // @ts-expect-error - mozHasAudio is Firefox-specific
    return video.mozHasAudio;
  }

  // WebKit-specific - only works AFTER video has played
  if ("webkitAudioDecodedByteCount" in video) {
    // @ts-expect-error - webkitAudioDecodedByteCount is WebKit-specific
    return video.webkitAudioDecodedByteCount > 0;
  }

  // Standard API (Safari 14.5+, behind flag in some versions)
  if ("audioTracks" in video && video.audioTracks) {
    // @ts-expect-error - audioTracks may not be available in all browsers
    return video.audioTracks.length > 0;
  }

  // Fallback: assume audio exists (safer for UX)
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
