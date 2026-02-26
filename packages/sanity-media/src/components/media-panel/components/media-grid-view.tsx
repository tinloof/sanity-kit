import {CheckmarkCircleIcon, ImageIcon, PlayIcon} from "@sanity/icons";
import {Box, Card, Flex, Stack, Text} from "@sanity/ui";
import {formatDuration, formatFileSize, getAssetPreviewUrl} from "../../../utils";
import {ResponsiveGrid} from "../../shared/responsive-grid";
import {TagList} from "../../shared/tag-list";
import {type MediaAsset, type Tag} from "../types";

export interface MediaGridViewProps {
	media: MediaAsset[];
	tags: Tag[];
	selectionMode: boolean;
	selectionTarget: MediaAsset | null;
	selectedIds: Set<string>;
	onItemClick: (item: MediaAsset) => void;
	onToggleSelection: (id: string) => void;
	/** Whether to show type indicators (image/video icons) - show when "all types" is selected */
	showTypeIndicator?: boolean;
}

export function MediaGridView({
	media,
	tags,
	selectionMode,
	selectionTarget,
	selectedIds,
	onItemClick,
	onToggleSelection,
	showTypeIndicator = false,
}: MediaGridViewProps) {
	return (
		<>
			<style>
				{`
          .media-grid-card {
            position: relative;
            clip-path: inset(0 -1px -1px -1px);
            transition: clip-path 0s 0.15s;
          }
          .media-grid-card:hover {
            clip-path: inset(-200px -1px -200px -1px);
            transition: clip-path 0s 0s;
          }
          .media-grid-card .media-card-footer {
            position: absolute;
            bottom: 0;
            left: -1px;
            right: -1px;
            transform: translateY(100%);
            transition: transform 0.15s ease-out;
            background: var(--card-bg-color);
            border-top: 1px solid var(--card-border-color);
          }
          .media-grid-card:hover .media-card-footer {
            transform: translateY(0);
          }
        `}
			</style>
			<ResponsiveGrid gap={3}>
				{media.map((item) => {
					const isSelected = selectionMode
						? selectionTarget?._id === item._id
						: selectedIds.has(item._id);
					const imageSrc = getAssetPreviewUrl(item);
					return (
						<Card
							key={item._id}
							radius={2}
							border
							className="media-grid-card"
							style={{
								cursor: "pointer",
								outline: isSelected
									? "2px solid var(--card-focus-ring-color)"
									: undefined,
								outlineOffset: "-2px",
								overflow: "hidden",
							}}
							tone="default"
							onClick={() => onItemClick(item)}
						>
							<Box
								style={{
									aspectRatio: "1",
									overflow: "hidden",
									background:
										item.mediaType === "video"
											? "#000"
											: "var(--card-bg-color)",
									position: "relative",
								}}
							>
								{imageSrc ? (
									<img
										src={imageSrc}
										alt={item.originalFilename || "Media"}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
											display: "block",
										}}
									/>
								) : (
									<Flex
										align="center"
										justify="center"
										style={{width: "100%", height: "100%"}}
									>
										<PlayIcon style={{fontSize: 24}} />
									</Flex>
								)}
								{/* Checkbox */}
								{!selectionMode && (
									<Box
										onClick={(e) => {
											e.stopPropagation();
											onToggleSelection(item._id);
										}}
										style={{
											position: "absolute",
											top: "6px",
											left: "6px",
											cursor: "pointer",
										}}
									>
										<Box
											style={{
												width: "14px",
												height: "14px",
												borderRadius: "3px",
												border: isSelected
													? "none"
													: "1.5px solid rgba(255,255,255,0.5)",
												background: isSelected
													? "var(--card-focus-ring-color)"
													: "rgba(0,0,0,0.3)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
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
								{/* Type indicator - only shown when viewing all types */}
								{showTypeIndicator && (
									<Box
										style={{
											position: "absolute",
											top: "6px",
											right: "6px",
											width: "14px",
											height: "14px",
											background: "rgba(0, 0, 0, 0.7)",
											borderRadius: "3px",
											color: "white",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
										}}
									>
										{item.mediaType === "video" ? (
											<PlayIcon style={{fontSize: 10}} />
										) : (
											<ImageIcon style={{fontSize: 10}} />
										)}
									</Box>
								)}
							</Box>
							{/* Footer */}
							<Box padding={3} className="media-card-footer">
								<Stack space={2}>
									<Text
										size={1}
										weight="medium"
										title={item.originalFilename || "Untitled"}
										textOverflow="ellipsis"
									>
										{item.originalFilename || "Untitled"}
									</Text>
									<Flex gap={2} align="center">
										<Text size={0} muted>
											{item.mediaType === "image"
												? item.metadata?.dimensions
													? `${item.metadata.dimensions.width}×${item.metadata.dimensions.height}`
													: "Image"
												: item.metadata?.duration
													? formatDuration(item.metadata.duration)
													: "Video"}
										</Text>
										{item.size && (
											<>
												<Text size={0} muted>
													•
												</Text>
												<Text size={0} muted>
													{formatFileSize(item.size)}
												</Text>
											</>
										)}
									</Flex>
									{item.tags && item.tags.length > 0 && (
										<TagList tagRefs={item.tags} tags={tags} />
									)}
								</Stack>
							</Box>
						</Card>
					);
				})}
			</ResponsiveGrid>
		</>
	);
}
