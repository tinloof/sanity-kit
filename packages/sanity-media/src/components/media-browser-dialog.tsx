import {PlayIcon} from "@sanity/icons";
import {
	Box,
	Button,
	Card,
	Dialog,
	Flex,
	Spinner,
	Stack,
	Text,
	TextInput,
} from "@sanity/ui";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useClient} from "sanity";
import {API_VERSION} from "../constants";
import {useAdapter} from "../context/adapter-context";
import {formatDuration, formatFileSize} from "../utils";
import {ResponsiveGrid} from "./shared/responsive-grid";

interface MediaBrowserDialogProps {
	onSelect: (asset: any) => void;
	onClose: () => void;
	assetType?: "image" | "file" | "video";
}

export function MediaBrowserDialog({
	onSelect,
	onClose,
	assetType = "image",
}: MediaBrowserDialogProps) {
	const client = useClient({apiVersion: API_VERSION});
	const {adapter} = useAdapter();

	const [assets, setAssets] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedAsset, setSelectedAsset] = useState<any>(null);

	// Get the document type for the asset
	const documentType = useMemo(() => {
		const typePrefix = adapter.typePrefix || "r2";
		switch (assetType) {
			case "image":
				return `${typePrefix}.imageAsset`;
			case "video":
				return `${typePrefix}.videoAsset`;
			case "file":
			default:
				return `${typePrefix}.fileAsset`;
		}
	}, [adapter.typePrefix, assetType]);

	// Fetch assets
	useEffect(() => {
		const fetchAssets = async () => {
			setLoading(true);
			setError(null);

			try {
				// For videos, we need to expand the thumbnail reference
				const projection = assetType === "video" ? `{ ..., thumbnail-> }` : "";

				const query = searchQuery
					? `*[_type == $type && originalFilename match $search] | order(_createdAt desc) [0...50] ${projection}`
					: `*[_type == $type] | order(_createdAt desc) [0...50] ${projection}`;

				const params: Record<string, string> = {type: documentType};
				if (searchQuery) {
					params.search = `*${searchQuery}*`;
				}

				const result = await client.fetch(query, params);
				setAssets(result);
			} catch (err) {
				console.error("Failed to fetch assets:", err);
				setError("Failed to load assets");
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(fetchAssets, 300);
		return () => clearTimeout(debounceTimer);
	}, [client, documentType, searchQuery, assetType]);

	const handleSelect = useCallback(() => {
		if (selectedAsset) {
			onSelect(selectedAsset);
		}
	}, [selectedAsset, onSelect]);

	const handleAssetClick = useCallback((asset: any) => {
		setSelectedAsset((prev: any) => (prev?._id === asset._id ? null : asset));
	}, []);

	const handleAssetDoubleClick = useCallback(
		(asset: any) => {
			onSelect(asset);
		},
		[onSelect],
	);

	return (
		<Dialog
			id="media-browser-dialog"
			header="Select media"
			width={3}
			padding={0}
			onClose={onClose}
			footer={
				<Box padding={3}>
					<Flex justify="flex-end" gap={2}>
						<Button text="Cancel" mode="ghost" onClick={onClose} />
						<Button
							text="Select"
							tone="primary"
							onClick={handleSelect}
							disabled={!selectedAsset}
						/>
					</Flex>
				</Box>
			}
		>
			<Box padding={4}>
				<Stack space={4}>
					<TextInput
						placeholder="Search files..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.currentTarget.value)}
					/>

					{loading && (
						<Flex justify="center" padding={5}>
							<Spinner />
						</Flex>
					)}

					{error && (
						<Card padding={3} tone="critical" radius={2}>
							<Text size={1}>{error}</Text>
						</Card>
					)}

					{!loading && !error && assets.length === 0 && (
						<Card padding={5} tone="transparent">
							<Flex justify="center" align="center" direction="column" gap={3}>
								<Text size={1} muted>
									No assets found
								</Text>
								{searchQuery && (
									<Text size={1} muted>
										Try a different search term
									</Text>
								)}
							</Flex>
						</Card>
					)}

					{!loading && !error && assets.length > 0 && (
						<>
							<style>
								{`
                  .browser-grid-card {
                    position: relative;
                    overflow: hidden;
                  }
                  .browser-grid-card .browser-card-footer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    transform: translateY(100%);
                    transition: transform 0.2s ease-out;
                    background: var(--card-bg-color);
                    border-top: 1px solid var(--card-border-color);
                  }
                  .browser-grid-card:hover .browser-card-footer {
                    transform: translateY(0);
                  }
                  .browser-card-footer .footer-text {
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.4;
                  }
                  .browser-card-footer .footer-meta {
                    font-size: 11px;
                    color: var(--card-muted-fg-color);
                    line-height: 1.4;
                  }
                `}
							</style>
							<ResponsiveGrid gap={3}>
								{assets.map((asset) => {
									const isVideo = assetType === "video";
									const isSelected = selectedAsset?._id === asset._id;
									const imageSrc = isVideo ? asset.thumbnail?.url : asset.url;

									return (
										<Card
											key={asset._id}
											radius={2}
											border
											className="browser-grid-card"
											style={{
												cursor: "pointer",
												outline: isSelected
													? "2px solid var(--card-focus-ring-color)"
													: undefined,
												outlineOffset: "-2px",
											}}
											tone="default"
											onClick={() => handleAssetClick(asset)}
											onDoubleClick={() => handleAssetDoubleClick(asset)}
										>
											{/* Thumbnail */}
											<Box
												style={{
													aspectRatio: "1",
													overflow: "hidden",
													background: isVideo ? "#000" : "var(--card-bg-color)",
													position: "relative",
												}}
											>
												{imageSrc ? (
													<img
														src={imageSrc}
														alt={asset.originalFilename || "Asset"}
														loading="lazy"
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
												{/* Video indicator */}
												{isVideo && (
													<Box
														style={{
															position: "absolute",
															top: "8px",
															right: "8px",
															background: "rgba(0, 0, 0, 0.7)",
															borderRadius: "4px",
															padding: "4px",
															color: "white",
															lineHeight: 0,
														}}
													>
														<PlayIcon />
													</Box>
												)}
											</Box>
											{/* Footer */}
											<Box padding={3} className="browser-card-footer">
												<div
													className="footer-text"
													title={asset.originalFilename || "Untitled"}
												>
													{asset.originalFilename || "Untitled"}
												</div>
												<div className="footer-meta" style={{marginTop: "4px"}}>
													{isVideo
														? asset.metadata?.duration
															? formatDuration(asset.metadata.duration)
															: "Video"
														: asset.metadata?.dimensions
															? `${asset.metadata.dimensions.width}×${asset.metadata.dimensions.height}`
															: "Image"}
													{asset.size && ` • ${formatFileSize(asset.size)}`}
												</div>
											</Box>
										</Card>
									);
								})}
							</ResponsiveGrid>
						</>
					)}
				</Stack>
			</Box>
		</Dialog>
	);
}
