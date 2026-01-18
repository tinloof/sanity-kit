import { SearchIcon } from "@sanity/icons";
import { TextInput } from "@sanity/ui";
import { useEffect, useRef } from "react";
import type { StorageAdapter } from "../../adapters";

// Debounced search input - uncontrolled to prevent parent re-renders on typing
export function DebouncedSearchInput({
  onSearch,
  delay = 300,
}: {
  onSearch: (value: string) => void;
  delay?: number;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <TextInput
      icon={SearchIcon}
      placeholder="Search..."
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onSearch(value), delay);
      }}
      fontSize={1}
      padding={3}
    />
  );
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

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

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  usage: "all",
  documentTypes: new Set(),
  documents: [],
  alt: null,
  title: null,
  caption: null,
};

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

export const MAX_CONCURRENT_UPLOADS = 3;

/** Number of items to show per page - edit this value to change pagination */
export const PAGE_SIZE = 50;

export const SORT_OPTIONS: SortOption[] = [
  { field: "date", direction: "desc", label: "Newest first" },
  { field: "date", direction: "asc", label: "Oldest first" },
  { field: "filename", direction: "asc", label: "Filename A-Z" },
  { field: "filename", direction: "desc", label: "Filename Z-A" },
  { field: "size", direction: "desc", label: "Largest first" },
  { field: "size", direction: "asc", label: "Smallest first" },
];

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  gray: { bg: "rgba(128, 128, 128, 0.2)", text: "#6b7280" },
  blue: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
  purple: { bg: "rgba(139, 92, 246, 0.2)", text: "#8b5cf6" },
  magenta: { bg: "rgba(236, 72, 153, 0.2)", text: "#ec4899" },
  red: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },
  orange: { bg: "rgba(249, 115, 22, 0.2)", text: "#f97316" },
  yellow: { bg: "rgba(234, 179, 8, 0.2)", text: "#ca8a04" },
  green: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
  cyan: { bg: "rgba(6, 182, 212, 0.2)", text: "#06b6d4" },
};
