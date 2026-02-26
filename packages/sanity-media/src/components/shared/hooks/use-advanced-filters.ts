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
  cycleMetadataFilter: (key: "alt" | "title" | "caption") => void;
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
    if (advancedFilters.alt !== null) count++;
    if (advancedFilters.title !== null) count++;
    if (advancedFilters.caption !== null) count++;
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

  // Cycle metadata filter: null → true (has) → false (missing) → null
  const cycleMetadataFilter = useCallback(
    (key: "alt" | "title" | "caption") => {
      setAdvancedFilters((prev) => {
        const current = prev[key];
        let next: boolean | null;
        if (current === null) {
          next = true; // No filter → Has
        } else if (current === true) {
          next = false; // Has → Missing
        } else {
          next = null; // Missing → No filter
        }
        return { ...prev, [key]: next };
      });
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

    if (advancedFilters.alt !== null) {
      chips.push({
        label: advancedFilters.alt ? "Has alt" : "Missing alt",
        onRemove: () => setAdvancedFilters((prev) => ({ ...prev, alt: null })),
      });
    }
    if (advancedFilters.title !== null) {
      chips.push({
        label: advancedFilters.title ? "Has title" : "Missing title",
        onRemove: () => setAdvancedFilters((prev) => ({ ...prev, title: null })),
      });
    }
    if (advancedFilters.caption !== null) {
      chips.push({
        label: advancedFilters.caption ? "Has caption" : "Missing caption",
        onRemove: () => setAdvancedFilters((prev) => ({ ...prev, caption: null })),
      });
    }

    return chips;
  }, [
    advancedFilters,
    updateUsageFilter,
    toggleDocumentType,
    removeDocument,
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
    cycleMetadataFilter,
    addDocument,
    removeDocument,
  };
}
