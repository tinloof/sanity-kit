import {
  ControlsIcon,
  ImageIcon,
  PlayIcon,
  SortIcon,
  ThLargeIcon,
  ThListIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
} from "@sanity/ui";
import type { SortOption, TypeFilter, ViewMode } from "../media-panel/types";
import { DebouncedSearchInput, SORT_OPTIONS } from "../media-panel/types";

export interface FilterToolbarProps {
  /** Current view mode */
  viewMode: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: ViewMode) => void;
  /** Callback when search text changes */
  onSearch: (query: string) => void;
  /** Current type filter */
  typeFilter: TypeFilter;
  /** Callback when type filter changes */
  onTypeFilterChange: (type: TypeFilter) => void;
  /** Current sort option */
  sortOption: SortOption;
  /** Callback when sort changes */
  onSortChange: (option: SortOption) => void;
  /** Asset counts for display */
  counts: { total: number; images: number; videos: number };
  /** Whether to show the view mode toggle */
  showViewToggle?: boolean;
  /** Whether to show the sidebar toggle */
  showSidebarToggle?: boolean;
  /** Callback when sidebar toggle is clicked */
  onSidebarToggle?: () => void;
  /** Whether sidebar is open */
  sidebarOpen?: boolean;
  /** Restrict type filter options (e.g., only show images for image input) */
  restrictTypeFilter?: "image" | "video";
}

export function FilterToolbar({
  viewMode,
  onViewModeChange,
  onSearch,
  typeFilter,
  onTypeFilterChange,
  sortOption,
  onSortChange,
  counts,
  showViewToggle = true,
  showSidebarToggle = false,
  onSidebarToggle,
  sidebarOpen = false,
  restrictTypeFilter,
}: FilterToolbarProps) {
  return (
    <Flex gap={2} wrap="wrap" align="center">
      {/* Sidebar & View Toggle */}
      {(showSidebarToggle || showViewToggle) && (
        <Flex
          style={{
            borderRadius: "3px",
            overflow: "hidden",
            border: "1px solid var(--card-border-color)",
          }}
        >
          {showSidebarToggle && (
            <>
              <Box className="media-sidebar-toggle">
                <Button
                  icon={ControlsIcon}
                  mode="bleed"
                  tone={sidebarOpen ? "primary" : "default"}
                  onClick={onSidebarToggle}
                  padding={3}
                  fontSize={1}
                  title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                  style={{
                    borderRadius: 0,
                    background: sidebarOpen
                      ? "var(--card-badge-default-bg-color)"
                      : "transparent",
                  }}
                />
              </Box>
              <Box
                className="media-sidebar-toggle"
                style={{
                  width: "1px",
                  background: "var(--card-border-color)",
                }}
              />
            </>
          )}
          {showViewToggle && (
            <>
              <Button
                icon={ThLargeIcon}
                mode="bleed"
                tone={viewMode === "grid" ? "primary" : "default"}
                onClick={() => onViewModeChange("grid")}
                padding={3}
                fontSize={1}
                title="Grid view"
                style={{
                  borderRadius: 0,
                  background:
                    viewMode === "grid"
                      ? "var(--card-badge-default-bg-color)"
                      : "transparent",
                }}
              />
              <Box
                style={{
                  width: "1px",
                  background: "var(--card-border-color)",
                }}
              />
              <Button
                icon={ThListIcon}
                mode="bleed"
                tone={viewMode === "list" ? "primary" : "default"}
                onClick={() => onViewModeChange("list")}
                padding={3}
                fontSize={1}
                title="List view"
                style={{
                  borderRadius: 0,
                  background:
                    viewMode === "list"
                      ? "var(--card-badge-default-bg-color)"
                      : "transparent",
                }}
              />
            </>
          )}
        </Flex>
      )}

      {/* Search */}
      <Box style={{ flex: 1, minWidth: "120px" }}>
        <DebouncedSearchInput onSearch={onSearch} />
      </Box>

      {/* Type Filter - only show if not restricted */}
      {!restrictTypeFilter && (
        <MenuButton
          button={
            <Button
              icon={
                typeFilter === "image"
                  ? ImageIcon
                  : typeFilter === "video"
                    ? PlayIcon
                    : undefined
              }
              text={
                typeFilter === "all"
                  ? "All types"
                  : typeFilter === "image"
                    ? `Images (${counts.images})`
                    : `Videos (${counts.videos})`
              }
              mode="ghost"
              fontSize={1}
              padding={3}
            />
          }
          id="type-filter-menu"
          menu={
            <Menu>
              <MenuItem
                text={`All types (${counts.total})`}
                pressed={typeFilter === "all"}
                onClick={() => onTypeFilterChange("all")}
                fontSize={1}
              />
              <MenuItem
                icon={ImageIcon}
                text={`Images (${counts.images})`}
                pressed={typeFilter === "image"}
                onClick={() => onTypeFilterChange("image")}
                fontSize={1}
              />
              <MenuItem
                icon={PlayIcon}
                text={`Videos (${counts.videos})`}
                pressed={typeFilter === "video"}
                onClick={() => onTypeFilterChange("video")}
                fontSize={1}
              />
            </Menu>
          }
          popover={{ portal: true }}
        />
      )}

      {/* Sort */}
      <MenuButton
        button={
          <Button
            icon={SortIcon}
            text={sortOption.label}
            mode="ghost"
            fontSize={1}
            padding={3}
          />
        }
        id="sort-menu"
        menu={
          <Menu>
            {SORT_OPTIONS.map((option) => (
              <MenuItem
                key={`${option.field}-${option.direction}`}
                text={option.label}
                pressed={
                  sortOption.field === option.field &&
                  sortOption.direction === option.direction
                }
                onClick={() => onSortChange(option)}
                fontSize={1}
              />
            ))}
          </Menu>
        }
        popover={{ portal: true }}
      />
    </Flex>
  );
}
