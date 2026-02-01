import type { StorageAdapter } from "../../adapters";

export type SortField = "date" | "filename" | "size";
export type SortDirection = "asc" | "desc";
export type TypeFilter = "all" | "image" | "video";
export type ViewMode = "grid" | "list";
export type UsageFilter = "all" | "inUse" | "unused";

export interface SelectedDocument {
  _id: string;
  _type: string;
  title: string;
}

export interface AdvancedFilters {
  usage: UsageFilter;
  documentTypes: Set<string>;
  documents: SelectedDocument[];
  /** null = no filter, true = has alt, false = missing alt */
  alt: boolean | null;
  /** null = no filter, true = has title, false = missing title */
  title: boolean | null;
  /** null = no filter, true = has caption, false = missing caption */
  caption: boolean | null;
}

export interface Tag {
  _id: string;
  name: string;
  color: string;
}

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export interface MediaPanelProps {
  adapter: StorageAdapter;
  /** Whether the panel is in selection mode (for reference input navigation) */
  selectionMode?: boolean;
  /** Asset type filter when in selection mode */
  selectionAssetType?: "image" | "video" | "file" | null;
  /** Callback when an asset is selected (in selection mode) */
  onSelect?: (asset: MediaAsset) => void;
  /** Callback to cancel selection mode */
  onCancelSelection?: () => void;
  /** Callback to open settings panel */
  onOpenSettings?: () => void;
}

export interface MediaAsset {
  _id: string;
  _type: string;
  _createdAt: string;
  url: string;
  originalFilename?: string;
  size?: number;
  mimeType?: string;
  extension?: string;
  mediaType: "image" | "video";
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
      aspectRatio?: number;
    };
    duration?: number;
    hasAlpha?: boolean;
    isOpaque?: boolean;
    lqip?: string;
  };
  thumbnail?: {
    _id: string;
    url: string;
  };
  tags?: Array<{
    _ref: string;
  }>;
  // User-facing metadata
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
}

export interface UploadItem {
  id: string;
  file: File;
  type: "image" | "video";
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  /** The created asset document ID (set on successful upload) */
  assetId?: string;
  // User-provided metadata
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  tags?: string[]; // Array of tag IDs
}

export interface StagingItem {
  id: string;
  file: File;
  type: "image" | "video";
  previewUrl: string;
  // User-provided metadata
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  tags?: string[]; // Array of tag IDs
  // UI state
  expanded?: boolean;
}

// Re-export constants for backwards compatibility
export {
  DEFAULT_ADVANCED_FILTERS,
  MAX_CONCURRENT_UPLOADS,
  PAGE_SIZE,
  SORT_OPTIONS,
  TAG_COLORS,
} from "../../constants";
