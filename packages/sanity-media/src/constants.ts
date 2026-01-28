import type {
  AdvancedFilters,
  SortOption,
} from "./components/media-panel/types";

/** API version used for Sanity client queries */
export const API_VERSION = "2025-01-01";

/** Maximum number of concurrent uploads */
export const MAX_CONCURRENT_UPLOADS = 3;

/** Number of items to show per page */
export const PAGE_SIZE = 50;

/** Default values for advanced filters */
export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  usage: "all",
  documentTypes: new Set(),
  documents: [],
  alt: null,
  title: null,
  caption: null,
};

/** Available sort options for media list */
export const SORT_OPTIONS: SortOption[] = [
  { field: "date", direction: "desc", label: "Newest first" },
  { field: "date", direction: "asc", label: "Oldest first" },
  { field: "filename", direction: "asc", label: "Filename A-Z" },
  { field: "filename", direction: "desc", label: "Filename Z-A" },
  { field: "size", direction: "desc", label: "Largest first" },
  { field: "size", direction: "asc", label: "Smallest first" },
];

/** Tag color palette */
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
