import {CheckmarkCircleIcon} from "@sanity/icons";
import {Box, Flex, Text} from "@sanity/ui";
import {formatDuration, formatFileSize} from "../../utils";
import type {ImageTransformer} from "../../context/adapter-context";
import type {MediaAsset, Tag} from "../media-panel/types";
import {TAG_COLORS} from "../media-panel/types";
import {ThumbnailCell} from "./thumbnail-cell";

export interface AssetListProps {
	assets: MediaAsset[];
	tags: Tag[];
	imageTransformer?: ImageTransformer;
	/** ID of single selected asset (for browse dialog) */
	selectedId?: string;
	/** Set of selected asset IDs (for multi-select in media panel) */
	selectedIds?: Set<string>;
	/** Called when an asset row is clicked */
	onSelect?: (asset: MediaAsset) => void;
	/** Called when checkbox is clicked to toggle selection */
	onToggleSelection?: (id: string) => void;
	/** Whether selection checkboxes are visible */
	showCheckboxes?: boolean;
}

export function AssetList({
	assets,
	tags,
	imageTransformer,
	selectedId,
	selectedIds,
	onSelect,
	onToggleSelection,
	showCheckboxes = true,
}: AssetListProps) {
	return (
		<>
			<style>
				{`
          .media-list-col-dimensions,
          .media-list-col-size,
          .media-list-col-date,
          .media-list-col-tags {
            display: none;
          }
          @media (min-width: 600px) {
            .media-list-col-dimensions,
            .media-list-col-tags {
              display: flex;
            }
          }
          @media (min-width: 768px) {
            .media-list-col-size,
            .media-list-col-date {
              display: block;
            }
          }
        `}
			</style>
			<Box>
				{assets.map((item) => {
					const isSelected =
						selectedId === item._id || selectedIds?.has(item._id);
					return (
						<Box
							key={item._id}
							paddingY={2}
							style={{
								cursor: "pointer",
								borderBottom: "1px solid var(--card-border-color)",
								background: isSelected
									? "var(--card-muted-bg-color)"
									: "transparent",
							}}
							onClick={() => onSelect?.(item)}
						>
							<Flex align="center" gap={3} paddingX={2}>
								<ThumbnailCell
									asset={item}
									imageTransformer={imageTransformer}
								/>

								{/* Filename */}
								<Text
									size={1}
									textOverflow="ellipsis"
									title={item.originalFilename || "Untitled"}
									style={{flex: 1, minWidth: 0}}
								>
									{item.originalFilename || "Untitled"}
								</Text>

								{/* Tags */}
								<Flex
									gap={1}
									className="media-list-col-tags"
									style={{flexShrink: 0, maxWidth: "150px"}}
								>
									{item.tags && item.tags.length > 0 ? (
										<>
											{item.tags.slice(0, 2).map((tagRef) => {
												const tag = tags.find((t) => t._id === tagRef._ref);
												if (!tag) return null;
												const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
												return (
													<Box
														key={tag._id}
														style={{
															background: colors.bg,
															color: colors.text,
															padding: "2px 6px",
															borderRadius: "3px",
															fontSize: "10px",
															fontWeight: 500,
															maxWidth: "60px",
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
													>
														{tag.name}
													</Box>
												);
											})}
											{item.tags.length > 2 && (
												<Box
													style={{
														background: "var(--card-muted-bg-color)",
														padding: "2px 6px",
														borderRadius: "3px",
														fontSize: "10px",
														fontWeight: 500,
													}}
												>
													+{item.tags.length - 2}
												</Box>
											)}
										</>
									) : null}
								</Flex>

								{/* Type & Dimensions - hidden on mobile */}
								<Text
									size={0}
									muted
									className="media-list-col-dimensions"
									style={{flexShrink: 0, width: "100px"}}
								>
									{item.mediaType === "image"
										? item.metadata?.dimensions
											? `${item.metadata.dimensions.width}×${item.metadata.dimensions.height}`
											: "Image"
										: item.metadata?.duration
											? formatDuration(item.metadata.duration)
											: "Video"}
								</Text>

								{/* Size - hidden on mobile/tablet */}
								<Text
									size={0}
									muted
									className="media-list-col-size"
									style={{flexShrink: 0, width: "70px", textAlign: "right"}}
								>
									{item.size ? formatFileSize(item.size) : "—"}
								</Text>

								{/* Date - hidden on mobile/tablet */}
								<Text
									size={0}
									muted
									className="media-list-col-date"
									style={{flexShrink: 0, width: "90px", textAlign: "right"}}
								>
									{new Date(item._createdAt).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</Text>

								{/* Checkbox */}
								{showCheckboxes && onToggleSelection && (
									<Box
										onClick={(e) => {
											e.stopPropagation();
											onToggleSelection(item._id);
										}}
										style={{
											flexShrink: 0,
											cursor: "pointer",
											padding: "4px",
										}}
									>
										<Box
											style={{
												width: "14px",
												height: "14px",
												borderRadius: "3px",
												border: isSelected
													? "none"
													: "1.5px solid var(--card-border-color)",
												background: isSelected
													? "var(--card-focus-ring-color)"
													: "transparent",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											{isSelected && (
												<CheckmarkCircleIcon
													style={{color: "white", fontSize: 10}}
												/>
											)}
										</Box>
									</Box>
								)}
							</Flex>
						</Box>
					);
				})}
			</Box>
		</>
	);
}
