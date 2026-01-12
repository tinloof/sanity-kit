export interface MediaStoragePluginConfig {
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadPrefix?: string;
}

/**
 * media.image value structure
 * alt and caption can be set here to override the defaults from the asset document
 */
export interface MediaImageValue {
  _type: "media.image";
  asset: {
    _type: "reference";
    _ref: string;
  };
  /** Overrides asset.alt if set */
  alt?: string;
  /** Overrides asset.caption if set */
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
 * title and description can be set here to override the defaults from the asset document
 */
export interface MediaFileValue {
  _type: "media.file";
  asset: {
    _type: "reference";
    _ref: string;
  };
  /** Overrides asset.title if set */
  title?: string;
  /** Overrides asset.description if set */
  description?: string;
}

export function isVideoContentType(contentType: string) {
  return contentType.startsWith("video/");
}

export function isImageContentType(contentType: string) {
  return contentType.startsWith("image/");
}
