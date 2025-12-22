export interface MediaStoragePluginConfig {
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadPrefix?: string;
}

/**
 * media.image value structure
 */
export interface MediaImageValue {
  _type: "media.image";
  asset: {
    _type: "reference";
    _ref: string;
  };
  alt?: string;
  caption?: string;
  crop?: {
    _type: "sanity.imageCrop";
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    _type: "sanity.imageHotspot";
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

/**
 * media.file value structure
 */
export interface MediaFileValue {
  _type: "media.file";
  asset: {
    _type: "reference";
    _ref: string;
  };
  title?: string;
  description?: string;
}

export function isVideoContentType(contentType: string) {
  return contentType.startsWith("video/");
}

export function isImageContentType(contentType: string) {
  return contentType.startsWith("image/");
}
