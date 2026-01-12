import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_ADVANCED_FILTERS,
  type AdvancedFilters,
  type SelectedDocument,
  type UsageFilter,
} from "../../media-panel/types";

export interface FilterChip {
  label: string;
  onRemove: () => void;
}

export interface UseAdvancedFiltersResult {
  // Filter state
  advancedFilters: AdvancedFilters;
  documentSearchQuery: string;

  // Computed values
  activeFilterCount: number;
  activeFilterChips: FilterChip[];
  hasActiveFilters: boolean;

  // Actions
  setDocumentSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
  updateUsageFilter: (usage: UsageFilter) => void;
  toggleDocumentType: (docType: string) => void;
  toggleMetadataFilter: (key: "hasAlt" | "hasTitle" | "hasCaption" | "missingAlt") => void;
  addDocument: (doc: SelectedDocument) => void;
  removeDocument: (docId: string) => void;
}

export function useAdvancedFilters(): UseAdvancedFiltersResult {
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(
    DEFAULT_ADVANCED_FILTERS
  );
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.usage !== "all") count++;
    if (advancedFilters.documentTypes.size > 0) count++;
    if (advancedFilters.documents.length > 0) count++;
    if (advancedFilters.hasAlt) count++;
    if (advancedFilters.hasTitle) count++;
    if (advancedFilters.hasCaption) count++;
    if (advancedFilters.missingAlt) count++;
    return count;
  }, [advancedFilters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
  }, []);

  // Update usage filter
  const updateUsageFilter = useCallback((usage: UsageFilter) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      usage,
      // Clear document types if switching away from "inUse"
      documentTypes: usage === "inUse" ? prev.documentTypes : new Set(),
    }));
  }, []);

  // Toggle document type filter
  const toggleDocumentType = useCallback((docType: string) => {
    setAdvancedFilters((prev) => {
      const next = new Set(prev.documentTypes);
      if (next.has(docType)) {
        next.delete(docType);
      } else {
        next.add(docType);
      }
      return { ...prev, documentTypes: next };
    });
  }, []);

  // Toggle metadata filter
  const toggleMetadataFilter = useCallback(
    (key: "hasAlt" | "hasTitle" | "hasCaption" | "missingAlt") => {
      setAdvancedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    []
  );

  // Add document to filter
  const addDocument = useCallback((doc: SelectedDocument) => {
    setAdvancedFilters((prev) => {
      // Don't add if already exists
      if (prev.documents.some((d) => d._id === doc._id)) return prev;
      return { ...prev, documents: [...prev.documents, doc] };
    });
    setDocumentSearchQuery("");
  }, []);

  // Remove document from filter
  const removeDocument = useCallback((docId: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d._id !== docId),
    }));
  }, []);

  // Generate filter chips
  const activeFilterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    if (advancedFilters.usage === "inUse") {
      chips.push({
        label: "In Use",
        onRemove: () => updateUsageFilter("all"),
      });
    } else if (advancedFilters.usage === "unused") {
      chips.push({
        label: "Unused",
        onRemove: () => updateUsageFilter("all"),
      });
    }

    if (advancedFilters.documentTypes.size > 0) {
      Array.from(advancedFilters.documentTypes).forEach((docType) => {
        chips.push({
          label: docType,
          onRemove: () => toggleDocumentType(docType),
        });
      });
    }

    if (advancedFilters.documents.length > 0) {
      advancedFilters.documents.forEach((doc) => {
        chips.push({
          label: doc.title,
          onRemove: () => removeDocument(doc._id),
        });
      });
    }

    if (advancedFilters.hasAlt) {
      chips.push({
        label: "Has alt",
        onRemove: () => toggleMetadataFilter("hasAlt"),
      });
    }
    if (advancedFilters.hasTitle) {
      chips.push({
        label: "Has title",
        onRemove: () => toggleMetadataFilter("hasTitle"),
      });
    }
    if (advancedFilters.hasCaption) {
      chips.push({
        label: "Has caption",
        onRemove: () => toggleMetadataFilter("hasCaption"),
      });
    }
    if (advancedFilters.missingAlt) {
      chips.push({
        label: "Missing alt",
        onRemove: () => toggleMetadataFilter("missingAlt"),
      });
    }

    return chips;
  }, [
    advancedFilters,
    updateUsageFilter,
    toggleDocumentType,
    removeDocument,
    toggleMetadataFilter,
  ]);

  return {
    advancedFilters,
    documentSearchQuery,
    activeFilterCount,
    activeFilterChips,
    hasActiveFilters,
    setDocumentSearchQuery,
    clearAllFilters,
    updateUsageFilter,
    toggleDocumentType,
    toggleMetadataFilter,
    addDocument,
    removeDocument,
  };
}
