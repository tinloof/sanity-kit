import {
	CopyIcon,
	DownloadIcon,
	EllipsisVerticalIcon,
	ImageIcon,
	ResetIcon,
	SearchIcon,
	UploadIcon,
} from "@sanity/icons";
import {
	Button,
	Card,
	Flex,
	Menu,
	MenuDivider,
	MenuItem,
	Popover,
	Spinner,
	Stack,
	Text,
	TextArea,
	TextInput,
	useToast,
} from "@sanity/ui";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import {
	set,
	unset,
	type ObjectInputProps,
	type SanityDocument,
	useClient,
	useFormValue,
} from "sanity";
import {styled} from "styled-components";
import {API_VERSION} from "../constants";
import {useAdapter} from "../context/adapter-context";
import {
	getPendingSelection,
	clearPendingSelection,
} from "../context/selection-context";
import {handleImageUpload} from "../upload-handler";
import {UploadStagingDialog} from "./media-panel/components";
import type {MediaAsset, StagingItem} from "./media-panel/types";
import {MediaBrowserDialog} from "./shared/media-browser-dialog";
import {useTags} from "./shared/hooks";

// ============================================================================
// Helpers
// ============================================================================

function createStagingItem(file: File, type: "image" | "video"): StagingItem {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		file,
		type,
		previewUrl: URL.createObjectURL(file),
		expanded: true,
	};
}

// ============================================================================
// Styled Components (matching Sanity's native ImageInput)
// ============================================================================

const RatioBox = styled(Card)`
  position: relative;
  width: 100%;
  min-height: 120px;
  max-height: min(calc(var(--image-height) * 1px), 30vh);
  aspect-ratio: var(--image-width) / var(--image-height);

  & img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: scale-down;
    object-position: center;
  }
`;

const MenuActionsWrapper = styled(Flex)`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  gap: 4px;
`;

const PlaceholderFlex = styled(Flex)`
  pointer-events: none;
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ProgressBar = styled.div`
  height: 4px;
  background-color: var(--card-border-color);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{$progress: number}>`
  width: ${(props) => props.$progress}%;
  height: 100%;
  background-color: var(--card-focus-ring-color);
  transition: width 0.2s ease;
`;

// ============================================================================
// Sub-components
// ============================================================================

function PlaceholderText({
	readOnly,
	hoveringFiles,
}: {
	readOnly?: boolean;
	hoveringFiles?: boolean;
}) {
	const messageText = useMemo(() => {
		if (readOnly) {
			return "Read only";
		}
		if (hoveringFiles) {
			return "Drop to upload";
		}
		return "Drag or paste image here";
	}, [readOnly, hoveringFiles]);

	return (
		<PlaceholderFlex align="center" gap={3} justify="center" paddingLeft={1}>
			<Text muted size={1}>
				<ImageIcon />
			</Text>
			<Text size={1} muted>
				{messageText}
			</Text>
		</PlaceholderFlex>
	);
}

function ImagePreview({
	src,
	alt,
	isLoading,
}: {
	src?: string;
	alt: string;
	isLoading?: boolean;
}) {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setLoaded(false);
	}, [src]);

	return (
		<RatioBox tone="transparent">
			{(isLoading || !loaded) && src && (
				<Flex
					align="center"
					justify="center"
					style={{position: "absolute", inset: 0}}
				>
					<Spinner />
				</Flex>
			)}
			{src && (
				<img
					src={src}
					alt={alt}
					onLoad={() => setLoaded(true)}
					referrerPolicy="strict-origin-when-cross-origin"
					style={isLoading || !loaded ? {opacity: 0} : undefined}
				/>
			)}
		</RatioBox>
	);
}

function ActionsMenu({
	onUpload,
	onBrowse,
	onClear,
	onDownload,
	onCopyUrl,
	readOnly,
	downloadUrl,
	copyUrl,
}: {
	onUpload: () => void;
	onBrowse: () => void;
	onClear: () => void;
	onDownload?: () => void;
	onCopyUrl?: () => void;
	readOnly?: boolean;
	downloadUrl?: string;
	copyUrl?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const {push: pushToast} = useToast();

	const handleCopyUrl = useCallback(() => {
		if (copyUrl) {
			navigator.clipboard.writeText(copyUrl);
			pushToast({
				closable: true,
				status: "success",
				title: "URL copied to clipboard",
			});
		}
		setIsOpen(false);
	}, [copyUrl, pushToast]);

	return (
		<MenuActionsWrapper>
			<Popover
				content={
					<Menu>
						<MenuItem
							icon={UploadIcon}
							text="Upload"
							onClick={() => {
								setIsOpen(false);
								onUpload();
							}}
							disabled={readOnly}
						/>
						<MenuDivider />
						<MenuItem
							icon={SearchIcon}
							text="Browse"
							onClick={() => {
								setIsOpen(false);
								onBrowse();
							}}
							disabled={readOnly}
						/>
						{(downloadUrl || copyUrl) && <MenuDivider />}
						{downloadUrl && (
							<MenuItem
								as="a"
								icon={DownloadIcon}
								text="Download"
								href={downloadUrl}
								download
							/>
						)}
						{copyUrl && (
							<MenuItem
								icon={CopyIcon}
								text="Copy URL"
								onClick={handleCopyUrl}
							/>
						)}
						<MenuDivider />
						<MenuItem
							tone="critical"
							icon={ResetIcon}
							text="Clear field"
							onClick={() => {
								setIsOpen(false);
								onClear();
							}}
							disabled={readOnly}
						/>
					</Menu>
				}
				open={isOpen}
				portal
				placement="bottom-end"
			>
				<Button
					icon={EllipsisVerticalIcon}
					mode="ghost"
					onClick={() => setIsOpen(!isOpen)}
					aria-label="Open image options"
				/>
			</Popover>
		</MenuActionsWrapper>
	);
}

function UploadProgress({
	progress,
	onCancel,
}: {
	progress: number;
	onCancel: () => void;
}) {
	return (
		<Card padding={4} radius={2} border>
			<Stack space={3}>
				<Flex align="center" justify="space-between">
					<Flex align="center" gap={2}>
						<Spinner />
						<Text size={1}>Uploading... {Math.round(progress)}%</Text>
					</Flex>
					<Button
						text="Cancel"
						mode="ghost"
						tone="critical"
						onClick={onCancel}
						fontSize={1}
						padding={3}
					/>
				</Flex>
				<ProgressBar>
					<ProgressFill $progress={progress} />
				</ProgressBar>
			</Stack>
		</Card>
	);
}

// ============================================================================
// Main Component
// ============================================================================

export function MediaImageInput(props: ObjectInputProps) {
	const {value, onChange, readOnly, path, schemaType} = props;
	const client = useClient({apiVersion: API_VERSION});
	const {
		adapter,
		credentials,
		loading: credentialsLoading,
		imageTransformer,
	} = useAdapter();
	const {tags} = useTags({adapter});
	const {push: pushToast} = useToast();

	// Get document info for pending selection handling
	const document = useFormValue([]) as SanityDocument | undefined;
	// Normalize document ID by removing drafts. prefix for consistent matching
	const rawDocumentId = document?._id;
	const documentId = rawDocumentId?.replace(/^drafts\./, "");
	// Build field path with bracket notation for array keys
	const fieldPath = path.reduce<string>((result, segment) => {
		if (typeof segment === "object" && "_key" in segment) {
			return `${result}[_key=="${segment._key}"]`;
		}
		return result ? `${result}.${String(segment)}` : String(segment);
	}, "");

	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [assetPreview, setAssetPreview] = useState<MediaAsset | null>(null);
	const [assetLoading, setAssetLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [showBrowser, setShowBrowser] = useState(false);

	// Staging state for upload with metadata
	const [stagingItems, setStagingItems] = useState<StagingItem[]>([]);
	const [showStagingDialog, setShowStagingDialog] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadAbortRef = useRef<AbortController | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Track original values to detect actual changes on blur
	const originalValuesRef = useRef<{alt?: string; caption?: string}>({});

	// Update original values when asset changes
	useEffect(() => {
		if (assetPreview) {
			originalValuesRef.current = {
				alt: assetPreview.alt,
				caption: assetPreview.caption,
			};
		}
	}, [assetPreview?._id]);

	// Check for pending selection from media tool navigation
	// Clear the pending selection immediately to prevent race conditions,
	// then apply it after a small delay to ensure document is ready
	useEffect(() => {
		if (!documentId || readOnly) return;

		const pendingAssetId = getPendingSelection(documentId, fieldPath);
		if (!pendingAssetId) return;

		// Clear immediately to prevent duplicate applications from re-renders
		// or other component instances
		clearPendingSelection(documentId, fieldPath);

		// Small delay to let the document finish loading
		const timer = setTimeout(() => {
			onChange(
				set({
					_type: schemaType?.name || "mediaImage",
					asset: {
						_type: "reference",
						_ref: pendingAssetId,
					},
				}),
			);
		}, 100);

		return () => clearTimeout(timer);
	}, [documentId, fieldPath, onChange, schemaType?.name, readOnly]);

	// Load asset preview when we have a reference
	const loadAsset = useCallback(async () => {
		if (value?.asset?._ref) {
			setAssetLoading(true);
			try {
				const asset = await client.getDocument(value.asset._ref);
				setAssetPreview(asset ? (asset as unknown as MediaAsset) : null);
			} catch (err) {
				console.error("Failed to load asset:", err);
			} finally {
				setAssetLoading(false);
			}
		} else {
			setAssetPreview(null);
		}
	}, [value?.asset?._ref, client]);

	useEffect(() => {
		loadAsset();
	}, [loadAsset]);

	// Calculate custom properties for aspect ratio
	const customProperties = useMemo(() => {
		const width = assetPreview?.metadata?.dimensions?.width || 400;
		const height = assetPreview?.metadata?.dimensions?.height || 300;
		return {
			"--image-width": width,
			"--image-height": height,
		} as CSSProperties;
	}, [assetPreview]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!credentials || readOnly) return;

			const file = e.target.files?.[0];
			if (file && file.type.startsWith("image/")) {
				setStagingItems([createStagingItem(file, "image")]);
				setShowStagingDialog(true);
				// Reset input for re-selection
				e.target.value = "";
			}
		},
		[credentials, readOnly],
	);

	const handleCancelUpload = useCallback(() => {
		uploadAbortRef.current?.abort();
		setUploading(false);
		setProgress(0);
	}, []);

	const handleRemove = useCallback(() => {
		onChange(unset());
		setAssetPreview(null);
	}, [onChange]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			if (!credentials || readOnly) return;

			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith("image/")) {
				setStagingItems([createStagingItem(file, "image")]);
				setShowStagingDialog(true);
			}
		},
		[credentials, readOnly],
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent) => {
			if (!credentials || readOnly) return;

			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.type.startsWith("image/")) {
					const file = item.getAsFile();
					if (file) {
						setStagingItems([createStagingItem(file, "image")]);
						setShowStagingDialog(true);
						break;
					}
				}
			}
		},
		[credentials, readOnly],
	);

	const handleBrowseSelect = useCallback(
		(asset: MediaAsset) => {
			onChange(
				set({
					...value,
					asset: {
						_type: "reference",
						_ref: asset._id,
					},
				}),
			);
			setShowBrowser(false);
		},
		[onChange, value],
	);

	const triggerUpload = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// Open media browser dialog
	const handleBrowse = useCallback(() => {
		setShowBrowser(true);
	}, []);

	// Staging dialog handlers
	const closeStagingDialog = useCallback(() => {
		stagingItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
		setStagingItems([]);
		setShowStagingDialog(false);
	}, [stagingItems]);

	const updateStagingItem = useCallback(
		(id: string, updates: Partial<StagingItem>) => {
			setStagingItems((prev) =>
				prev.map((item) => (item.id === id ? {...item, ...updates} : item)),
			);
		},
		[],
	);

	const removeStagingItem = useCallback((id: string) => {
		setStagingItems((prev) => {
			const item = prev.find((i) => i.id === id);
			if (item) {
				URL.revokeObjectURL(item.previewUrl);
			}
			const remaining = prev.filter((i) => i.id !== id);
			if (remaining.length === 0) {
				setShowStagingDialog(false);
			}
			return remaining;
		});
	}, []);

	const startUpload = useCallback(async () => {
		if (!credentials || stagingItems.length === 0) return;

		const item = stagingItems[0];
		setShowStagingDialog(false);
		setUploading(true);
		setProgress(0);
		setError(null);

		try {
			const assetRef = await handleImageUpload(
				item.file,
				adapter,
				credentials,
				client,
				(pct) => setProgress(pct),
				{alt: item.alt, caption: item.caption, tags: item.tags},
			);

			onChange(
				set({
					_type: schemaType?.name || "mediaImage",
					asset: {
						_type: "reference",
						_ref: assetRef._ref,
					},
				}),
			);

			// Cleanup
			URL.revokeObjectURL(item.previewUrl);
			setStagingItems([]);
		} catch (err) {
			if (err instanceof Error && err.name !== "AbortError") {
				setError(err.message);
			}
		} finally {
			setUploading(false);
		}
	}, [credentials, stagingItems, adapter, client, onChange, schemaType?.name]);

	// Update asset metadata on blur
	const updateAssetMetadata = useCallback(
		async (field: "alt" | "caption", value: string) => {
			if (!assetPreview?._id) return;

			const originalValue = originalValuesRef.current[field] || "";
			if (value === originalValue) return;

			try {
				await client
					.patch(assetPreview._id)
					.set({[field]: value || ""})
					.commit();
				originalValuesRef.current[field] = value;
			} catch (err) {
				console.error(`Failed to update ${field}:`, err);
				pushToast({
					closable: true,
					status: "error",
					title: `Failed to save ${field}`,
					description: "Your changes were not saved. Please try again.",
				});
				// Revert local state to original value
				setAssetPreview((prev) =>
					prev ? {...prev, [field]: originalValue} : prev,
				);
			}
		},
		[assetPreview?._id, client, pushToast],
	);

	// Loading state
	if (credentialsLoading) {
		return (
			<Card padding={4}>
				<Flex justify="center" align="center">
					<Spinner />
				</Flex>
			</Card>
		);
	}

	// No credentials
	if (!credentials) {
		return (
			<Card padding={4} radius={2} shadow={1} tone="caution">
				<Stack space={2}>
					<Text size={2} weight="semibold">
						Storage Not Configured
					</Text>
					<Text size={1} muted>
						Configure storage credentials in Sanity to enable uploads.
					</Text>
				</Stack>
			</Card>
		);
	}

	// Uploading state
	if (uploading) {
		return <UploadProgress progress={progress} onCancel={handleCancelUpload} />;
	}

	// Asset loading (after upload, before preview loads)
	if (value?.asset?._ref && !assetPreview) {
		return (
			<Card padding={4} radius={2} border>
				<Flex justify="center" align="center" style={{minHeight: 100}}>
					<Spinner />
				</Flex>
			</Card>
		);
	}

	// Has asset
	if (value?.asset?._ref && assetPreview) {
		return (
			<div ref={containerRef}>
				<Stack space={4}>
					<div style={{padding: 1, ...customProperties}}>
						<Card
							border
							radius={2}
							onPaste={handlePaste}
							tabIndex={0}
							style={{position: "relative"}}
						>
							<ImagePreview
								src={
									imageTransformer && assetPreview.url
										? imageTransformer(assetPreview.url, {
												width: 600,
												fit: "cover",
											})
										: assetPreview.url
								}
								alt={
									value.alt ||
									assetPreview.alt ||
									assetPreview.originalFilename ||
									"Image"
								}
								isLoading={assetLoading}
							/>
							<ActionsMenu
								onUpload={triggerUpload}
								onBrowse={handleBrowse}
								onClear={handleRemove}
								downloadUrl={assetPreview.url}
								copyUrl={assetPreview.url}
								readOnly={readOnly}
							/>
						</Card>
					</div>

					{/* Metadata Fields */}
					<Stack space={2}>
						<Text size={1} weight="medium">
							Alt text
						</Text>
						<TextInput
							value={assetPreview.alt || ""}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const value = e.currentTarget.value;
								setAssetPreview((prev) =>
									prev ? {...prev, alt: value} : prev,
								);
							}}
							onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
								updateAssetMetadata("alt", e.currentTarget.value);
							}}
							placeholder="Describe the image for accessibility"
							disabled={readOnly}
						/>
					</Stack>
					<Stack space={2}>
						<Text size={1} weight="medium">
							Caption
						</Text>
						<TextArea
							value={assetPreview.caption || ""}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
								const value = e.currentTarget.value;
								setAssetPreview((prev) =>
									prev ? {...prev, caption: value} : prev,
								);
							}}
							onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
								updateAssetMetadata("caption", e.currentTarget.value);
							}}
							placeholder="Add a caption"
							rows={2}
							disabled={readOnly}
						/>
					</Stack>

					<HiddenInput
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleInputChange}
					/>

					{showBrowser && (
						<MediaBrowserDialog
							onSelect={handleBrowseSelect}
							onClose={() => setShowBrowser(false)}
							adapter={adapter}
							assetType="image"
							allowUpload={!readOnly}
							imageTransformer={imageTransformer}
						/>
					)}

					{showStagingDialog && stagingItems.length > 0 && (
						<UploadStagingDialog
							stagingItems={stagingItems}
							tags={tags}
							onClose={closeStagingDialog}
							onStartUpload={startUpload}
							onUpdateItem={updateStagingItem}
							onRemoveItem={removeStagingItem}
						/>
					)}

					{error && (
						<Card padding={3} tone="critical" radius={2}>
							<Text size={1}>{error}</Text>
						</Card>
					)}
				</Stack>
			</div>
		);
	}

	// Empty state - upload placeholder
	return (
		<div ref={containerRef}>
			<Stack space={3}>
				<div style={{padding: 1}}>
					<Card
						border
						paddingX={3}
						paddingY={2}
						radius={2}
						tone={isDragging ? "primary" : readOnly ? "transparent" : "inherit"}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onPaste={handlePaste}
						tabIndex={0}
					>
						<Flex align="center" gap={4} justify="space-between">
							<Flex flex={1}>
								<PlaceholderText
									readOnly={readOnly}
									hoveringFiles={isDragging}
								/>
							</Flex>

							<Flex align="center" gap={1}>
								<Button
									icon={UploadIcon}
									text="Upload"
									mode="bleed"
									onClick={triggerUpload}
									disabled={readOnly}
									fontSize={1}
									padding={3}
								/>
								<HiddenInput
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleInputChange}
									disabled={readOnly}
								/>

								<Button
									icon={SearchIcon}
									text="Browse"
									mode="bleed"
									onClick={handleBrowse}
									disabled={readOnly}
									fontSize={1}
									padding={3}
								/>
							</Flex>
						</Flex>
					</Card>
				</div>

				{showBrowser && (
					<MediaBrowserDialog
						onSelect={handleBrowseSelect}
						onClose={() => setShowBrowser(false)}
						adapter={adapter}
						assetType="image"
						allowUpload={!readOnly}
						imageTransformer={imageTransformer}
					/>
				)}

				{showStagingDialog && stagingItems.length > 0 && (
					<UploadStagingDialog
						stagingItems={stagingItems}
						tags={tags}
						onClose={closeStagingDialog}
						onStartUpload={startUpload}
						onUpdateItem={updateStagingItem}
						onRemoveItem={removeStagingItem}
					/>
				)}

				{error && (
					<Card padding={3} tone="critical" radius={2}>
						<Text size={1}>{error}</Text>
					</Card>
				)}
			</Stack>
		</div>
	);
}
