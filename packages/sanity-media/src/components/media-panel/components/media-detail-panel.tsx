import {
	AddIcon,
	CloseIcon,
	CopyIcon,
	DocumentIcon,
	ImageIcon,
	PlayIcon,
	TrashIcon,
} from "@sanity/icons";
import type {ImageTransformer} from "../../../types";
import {
	Box,
	Button,
	Card,
	Flex,
	Menu,
	MenuButton,
	MenuItem,
	Spinner,
	Stack,
	Switch,
	Tab,
	TabList,
	TabPanel,
	Text,
	TextArea,
	TextInput,
	useToast,
} from "@sanity/ui";
import {useEffect, useRef, useState} from "react";
import {useClient} from "sanity";
import {IntentLink} from "sanity/router";
import {API_VERSION} from "../../../constants";
import {formatDuration, formatFileSize} from "../../../utils";
import type {MediaAsset, Tag} from "../types";
import {TAG_COLORS} from "../types";

export interface Reference {
	_id: string;
	_type: string;
	title?: string;
	url?: string;
	thumbnailUrl?: string;
	isAsset: boolean;
	assetType?: "image" | "video";
}

export interface MediaDetailPanelProps {
	media: MediaAsset;
	allMedia: MediaAsset[];
	tags: Tag[];
	references: Reference[] | undefined;
	referencesLoading: boolean;
	onClose: () => void;
	onMediaChange: (media: MediaAsset) => void;
	onNavigateToMedia: (media: MediaAsset) => void;
	onDelete: () => void;
	onMutate: () => void;
	isDeleting: boolean;
	imageTransformer?: ImageTransformer;
}

export function MediaDetailPanel({
	media,
	allMedia,
	tags,
	references,
	referencesLoading,
	onClose,
	onMediaChange,
	onNavigateToMedia,
	onDelete,
	onMutate,
	isDeleting,
	imageTransformer,
}: MediaDetailPanelProps) {
	const client = useClient({apiVersion: API_VERSION});
	const toast = useToast();
	const [activeTab, setActiveTab] = useState<"details" | "references">(
		"details",
	);

	// Track original values to detect actual changes on blur
	const originalValuesRef = useRef<{
		alt?: string;
		caption?: string;
		title?: string;
		description?: string;
	}>({});

	// Update original values when media changes (e.g., navigating to different asset)
	useEffect(() => {
		originalValuesRef.current = {
			alt: media.alt,
			caption: media.caption,
			title: media.title,
			description: media.description,
		};
	}, [media._id]);

	const copyToClipboard = async (text: string, label: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.push({
				status: "success",
				title: `${label} copied to clipboard`,
			});
		} catch {
			toast.push({
				status: "error",
				title: "Failed to copy to clipboard",
			});
		}
	};

	const updateMetadata = async (
		field: "alt" | "caption" | "title" | "description",
		value: string,
	) => {
		// Only update if the value has actually changed from the original
		const originalValue = originalValuesRef.current[field] || "";
		if (value === originalValue) {
			return;
		}

		try {
			await client
				.patch(media._id)
				.set({[field]: value || ""})
				.commit();
			// Update the original value ref after successful save
			originalValuesRef.current[field] = value;
			onMutate();
		} catch (error) {
			toast.push({
				status: "error",
				title: `Failed to update ${field}`,
			});
		}
	};

	const updateHasAudio = async (hasAudio: boolean) => {
		try {
			await client
				.patch(media._id)
				.set({"metadata.hasAudio": hasAudio})
				.commit();
			onMediaChange({
				...media,
				metadata: {
					...media.metadata,
					hasAudio,
				},
			});
			onMutate();
			toast.push({
				status: "success",
				title: `Audio setting updated`,
			});
		} catch (error) {
			toast.push({
				status: "error",
				title: "Failed to update audio setting",
			});
		}
	};

	const addTag = async (tag: Tag) => {
		const currentTags = media.tags || [];
		const newTags = [
			...currentTags,
			{_type: "reference", _ref: tag._id, _key: tag._id},
		];
		try {
			await client.patch(media._id).set({tags: newTags}).commit();
			onMediaChange({
				...media,
				tags: newTags,
			});
			onMutate();
			toast.push({
				status: "success",
				title: `Tag "${tag.name}" added`,
			});
		} catch (error) {
			toast.push({
				status: "error",
				title: "Failed to add tag",
			});
		}
	};

	const removeTag = async (tag: Tag) => {
		const newTags = media.tags?.filter((t) => t._ref !== tag._id);
		try {
			await client
				.patch(media._id)
				.set({tags: newTags || []})
				.commit();
			onMediaChange({
				...media,
				tags: newTags,
			});
			onMutate();
			toast.push({
				status: "success",
				title: `Tag "${tag.name}" removed`,
			});
		} catch (error) {
			toast.push({
				status: "error",
				title: "Failed to remove tag",
			});
		}
	};

	// Find thumbnail asset for videos
	const thumbnailAsset =
		media.mediaType === "video" && media.thumbnail
			? allMedia.find((m) => m._id === media.thumbnail?._id)
			: null;

	// Find parent video if this image is used as thumbnail
	const parentVideo =
		media.mediaType === "image"
			? allMedia.find(
					(m) => m.mediaType === "video" && m.thumbnail?._id === media._id,
				)
			: null;

	return (
		<>
			{/* Backdrop */}
			<Box
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					background: "rgba(0, 0, 0, 0.5)",
					zIndex: 100,
				}}
			/>

			{/* Side Panel */}
			<Card
				shadow={2}
				style={{
					position: "fixed",
					top: "2%",
					right: 0,
					bottom: "2%",
					width: "450px",
					maxWidth: "90vw",
					zIndex: 101,
					display: "flex",
					flexDirection: "column",
					borderTopLeftRadius: "8px",
					borderBottomLeftRadius: "8px",
					overflow: "hidden",
				}}
			>
				{/* Header */}
				<Box
					padding={3}
					style={{
						borderBottom: "1px solid var(--card-border-color)",
						flexShrink: 0,
					}}
				>
					<Flex justify="space-between" align="center" gap={2}>
						<Text
							size={1}
							weight="semibold"
							textOverflow="ellipsis"
							style={{minWidth: 0}}
						>
							{media.originalFilename || "Media Details"}
						</Text>
						<Button
							icon={CloseIcon}
							mode="bleed"
							onClick={onClose}
							padding={2}
						/>
					</Flex>
				</Box>

				{/* Preview */}
				<Box
					padding={4}
					style={{
						borderBottom: "1px solid var(--card-border-color)",
						flexShrink: 0,
					}}
				>
					<Box
						style={{
							background: "#000",
							borderRadius: "4px",
							overflow: "hidden",
							maxHeight: "250px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{media.mediaType === "image" ? (
							<img
								src={
									imageTransformer
										? imageTransformer(media.url, {
												width: 900,
												fit: "scale-down",
											})
										: media.url
								}
								alt={media.originalFilename || "Image preview"}
								style={{
									maxWidth: "100%",
									maxHeight: "250px",
									objectFit: "contain",
								}}
							/>
						) : (
							<video
								src={media.url}
								controls
								style={{
									maxWidth: "100%",
									maxHeight: "250px",
								}}
							/>
						)}
					</Box>
				</Box>

				{/* Tabs */}
				<Box
					padding={2}
					style={{
						borderBottom: "1px solid var(--card-border-color)",
						flexShrink: 0,
					}}
				>
					<TabList space={2}>
						<Tab
							aria-controls="details-panel"
							id="details-tab"
							label="Details"
							onClick={() => setActiveTab("details")}
							selected={activeTab === "details"}
						/>
						<Tab
							aria-controls="references-panel"
							id="references-tab"
							label={`References${references ? ` (${references.length})` : ""}`}
							onClick={() => setActiveTab("references")}
							selected={activeTab === "references"}
						/>
					</TabList>
				</Box>

				{/* Tab Content */}
				<Box style={{flex: 1, overflowY: "auto"}}>
					{/* Details Tab */}
					<TabPanel
						aria-labelledby="details-tab"
						id="details-panel"
						hidden={activeTab !== "details"}
					>
						<Box padding={4}>
							<Stack space={5}>
								{/* File Info */}
								<Stack space={3}>
									<Text size={1} weight="semibold">
										File info
									</Text>
									<Card padding={3} radius={2} tone="transparent" border>
										<Stack space={3}>
											<Flex justify="space-between">
												<Text size={1} muted>
													Filename
												</Text>
												<Text
													size={1}
													style={{wordBreak: "break-word", textAlign: "right"}}
												>
													{media.originalFilename || "Untitled"}
												</Text>
											</Flex>
											<Flex justify="space-between">
												<Text size={1} muted>
													Type
												</Text>
												<Text size={1}>
													{media.mimeType ||
														(media.mediaType === "image" ? "Image" : "Video")}
												</Text>
											</Flex>
											{media.size && (
												<Flex justify="space-between">
													<Text size={1} muted>
														Size
													</Text>
													<Text size={1}>{formatFileSize(media.size)}</Text>
												</Flex>
											)}
											{media.metadata?.dimensions && (
												<Flex justify="space-between">
													<Text size={1} muted>
														Dimensions
													</Text>
													<Text size={1}>
														{media.metadata.dimensions.width} ×{" "}
														{media.metadata.dimensions.height}
													</Text>
												</Flex>
											)}
											{media.mediaType === "video" &&
												media.metadata?.duration && (
													<Flex justify="space-between">
														<Text size={1} muted>
															Duration
														</Text>
														<Text size={1}>
															{formatDuration(media.metadata.duration)}
														</Text>
													</Flex>
												)}
											<Flex justify="space-between">
												<Text size={1} muted>
													Uploaded
												</Text>
												<Text size={1}>
													{new Date(media._createdAt).toLocaleDateString(
														undefined,
														{
															year: "numeric",
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
												</Text>
											</Flex>
										</Stack>
									</Card>
								</Stack>

								{/* Editable Metadata */}
								<Stack space={3}>
									<Text size={1} weight="semibold">
										Metadata
									</Text>
									<Card padding={3} radius={2} tone="transparent" border>
										<Stack space={4}>
											{media.mediaType === "image" ? (
												<>
													<Stack space={2}>
														<Text size={1} weight="medium">
															Alt text
														</Text>
														<TextInput
															value={media.alt || ""}
															onChange={(
																e: React.ChangeEvent<HTMLInputElement>,
															) => {
																onMediaChange({
																	...media,
																	alt: e.currentTarget.value,
																});
															}}
															onBlur={(
																e: React.FocusEvent<HTMLInputElement>,
															) => {
																updateMetadata("alt", e.currentTarget.value);
															}}
															placeholder="Describe the image for accessibility"
														/>
													</Stack>
													<Stack space={2}>
														<Text size={1} weight="medium">
															Caption
														</Text>
														<TextArea
															value={media.caption || ""}
															onChange={(
																e: React.ChangeEvent<HTMLTextAreaElement>,
															) => {
																onMediaChange({
																	...media,
																	caption: e.currentTarget.value,
																});
															}}
															onBlur={(
																e: React.FocusEvent<HTMLTextAreaElement>,
															) => {
																updateMetadata(
																	"caption",
																	e.currentTarget.value,
																);
															}}
															placeholder="Add a caption for this image"
															rows={2}
														/>
													</Stack>
												</>
											) : (
												<>
													<Stack space={2}>
														<Text size={1} weight="medium">
															Title
														</Text>
														<TextInput
															value={media.title || ""}
															onChange={(
																e: React.ChangeEvent<HTMLInputElement>,
															) => {
																onMediaChange({
																	...media,
																	title: e.currentTarget.value,
																});
															}}
															onBlur={(
																e: React.FocusEvent<HTMLInputElement>,
															) => {
																updateMetadata("title", e.currentTarget.value);
															}}
															placeholder="Add a title for this video"
														/>
													</Stack>
													<Stack space={2}>
														<Text size={1} weight="medium">
															Description
														</Text>
														<TextArea
															value={media.description || ""}
															onChange={(
																e: React.ChangeEvent<HTMLTextAreaElement>,
															) => {
																onMediaChange({
																	...media,
																	description: e.currentTarget.value,
																});
															}}
															onBlur={(
																e: React.FocusEvent<HTMLTextAreaElement>,
															) => {
																updateMetadata(
																	"description",
																	e.currentTarget.value,
																);
															}}
															placeholder="Add a description for this video"
															rows={3}
														/>
													</Stack>
													<Card border padding={3} radius={2}>
														<Flex gap={3} align="flex-start">
															<Switch
																checked={media.metadata?.hasAudio ?? true}
																onChange={(
																	event: React.ChangeEvent<HTMLInputElement>,
																) => {
																	updateHasAudio(event.currentTarget.checked);
																}}
															/>
															<Stack space={2}>
																<Text size={1} weight="medium">
																	Has audio
																</Text>
																<Text size={1} muted>
																	Indicates whether the video contains an audio
																	track
																</Text>
															</Stack>
														</Flex>
													</Card>
												</>
											)}
										</Stack>
									</Card>
								</Stack>

								{/* Thumbnail (for videos) */}
								{media.mediaType === "video" && media.thumbnail?.url && (
									<Stack space={3}>
										<Text size={1} weight="semibold">
											Thumbnail
										</Text>
										<Card padding={2} radius={2} tone="transparent" border>
											<Box
												onClick={() => {
													if (thumbnailAsset) {
														onNavigateToMedia(thumbnailAsset);
													}
												}}
												style={{
													borderRadius: "4px",
													overflow: "hidden",
													cursor: "pointer",
												}}
											>
												<Flex align="center" gap={3} padding={2}>
													<Box
														style={{
															width: "60px",
															height: "60px",
															borderRadius: "4px",
															overflow: "hidden",
															flexShrink: 0,
															background: "#000",
														}}
													>
														<img
															src={media.thumbnail.url}
															alt="Thumbnail"
															style={{
																width: "100%",
																height: "100%",
																objectFit: "cover",
															}}
														/>
													</Box>
													<Stack space={2} style={{flex: 1, minWidth: 0}}>
														<Text
															size={1}
															weight="medium"
															textOverflow="ellipsis"
														>
															{thumbnailAsset?.originalFilename ||
																"Thumbnail image"}
														</Text>
														<Text size={0} muted>
															Click to view image
														</Text>
													</Stack>
												</Flex>
											</Box>
										</Card>
									</Stack>
								)}

								{/* Thumbnail of (for images that are video thumbnails) */}
								{parentVideo && (
									<Stack space={3}>
										<Text size={1} weight="semibold">
											Thumbnail of
										</Text>
										<Card padding={2} radius={2} tone="transparent" border>
											<Box
												onClick={() => onNavigateToMedia(parentVideo)}
												style={{
													borderRadius: "4px",
													overflow: "hidden",
													background: "#000",
													cursor: "pointer",
												}}
											>
												<Flex align="center" gap={3} padding={2}>
													<Box
														style={{
															width: "60px",
															height: "60px",
															borderRadius: "4px",
															overflow: "hidden",
															flexShrink: 0,
														}}
													>
														{parentVideo.thumbnail?.url ? (
															<img
																src={parentVideo.thumbnail.url}
																alt="Video thumbnail"
																style={{
																	width: "100%",
																	height: "100%",
																	objectFit: "cover",
																}}
															/>
														) : (
															<Flex
																align="center"
																justify="center"
																style={{
																	width: "100%",
																	height: "100%",
																	background: "#333",
																}}
															>
																<PlayIcon />
															</Flex>
														)}
													</Box>
													<Stack space={2} style={{flex: 1, minWidth: 0}}>
														<Text
															size={1}
															weight="medium"
															textOverflow="ellipsis"
														>
															{parentVideo.originalFilename || "Untitled video"}
														</Text>
														<Text size={0} muted>
															Click to view video
														</Text>
													</Stack>
												</Flex>
											</Box>
										</Card>
									</Stack>
								)}

								{/* Tags */}
								<Stack space={3}>
									<Flex align="center" justify="space-between">
										<Text size={1} weight="semibold">
											Tags
										</Text>
										<MenuButton
											button={
												<Button
													icon={AddIcon}
													text="Add"
													mode="ghost"
													fontSize={0}
													padding={2}
												/>
											}
											id="add-tag-menu"
											menu={
												<Menu>
													{tags.length === 0 ? (
														<MenuItem
															text="No tags available"
															disabled
															fontSize={1}
														/>
													) : (
														tags
															.filter(
																(tag) =>
																	!media.tags?.some((t) => t._ref === tag._id),
															)
															.map((tag) => {
																const colors =
																	TAG_COLORS[tag.color] || TAG_COLORS.gray;
																return (
																	<MenuItem
																		key={tag._id}
																		onClick={() => addTag(tag)}
																		fontSize={1}
																	>
																		<Flex align="center" gap={2}>
																			<Box
																				style={{
																					width: "8px",
																					height: "8px",
																					borderRadius: "50%",
																					background: colors.text,
																					flexShrink: 0,
																				}}
																			/>
																			<Text size={1}>{tag.name}</Text>
																		</Flex>
																	</MenuItem>
																);
															})
													)}
													{tags.length > 0 &&
														media.tags?.length === tags.length && (
															<MenuItem
																text="All tags already added"
																disabled
																fontSize={1}
															/>
														)}
												</Menu>
											}
											popover={{portal: true}}
										/>
									</Flex>
									{media.tags && media.tags.length > 0 ? (
										<Flex gap={2} wrap="wrap">
											{media.tags.map((tagRef) => {
												const tag = tags.find((t) => t._id === tagRef._ref);
												if (!tag) return null;
												const colors = TAG_COLORS[tag.color] || TAG_COLORS.gray;
												return (
													<Box
														key={tag._id}
														style={{
															background: colors.bg,
															color: colors.text,
															padding: "4px 8px",
															borderRadius: "4px",
															fontSize: "12px",
															fontWeight: 500,
															display: "flex",
															alignItems: "center",
															gap: "6px",
														}}
													>
														{tag.name}
														<Box
															as="button"
															onClick={() => removeTag(tag)}
															style={{
																background: "none",
																border: "none",
																padding: 0,
																cursor: "pointer",
																display: "flex",
																alignItems: "center",
																color: "inherit",
																opacity: 0.7,
															}}
														>
															<CloseIcon style={{fontSize: 12}} />
														</Box>
													</Box>
												);
											})}
										</Flex>
									) : (
										<Text size={1} muted>
											No tags assigned
										</Text>
									)}
								</Stack>

								{/* Actions */}
								<Stack space={3}>
									<Text size={1} weight="semibold">
										Actions
									</Text>
									<Flex gap={3} wrap="wrap">
										<Button
											icon={CopyIcon}
											text="Copy URL"
											mode="ghost"
											onClick={() => copyToClipboard(media.url, "URL")}
											fontSize={1}
											padding={3}
										/>
										<Button
											icon={TrashIcon}
											text="Delete"
											mode="ghost"
											tone="critical"
											onClick={onDelete}
											disabled={isDeleting}
											fontSize={1}
											padding={3}
										/>
									</Flex>
								</Stack>
							</Stack>
						</Box>
					</TabPanel>

					{/* References Tab */}
					<TabPanel
						aria-labelledby="references-tab"
						id="references-panel"
						hidden={activeTab !== "references"}
					>
						<Box padding={4}>
							{referencesLoading ? (
								<Flex justify="center" padding={4}>
									<Spinner />
								</Flex>
							) : references && references.length > 0 ? (
								<Stack space={4}>
									{/* Asset References */}
									{(() => {
										const assetRefs = references.filter((r) => r.isAsset);
										if (assetRefs.length === 0) return null;
										return (
											<Stack space={3}>
												<Text size={1} weight="semibold">
													Media assets
												</Text>
												<Text size={0} muted>
													{assetRefs.length} asset
													{assetRefs.length !== 1 ? "s" : ""} using this as
													thumbnail
												</Text>
												<Stack space={2}>
													{assetRefs.map((ref) => {
														const previewUrl =
															ref.assetType === "video"
																? ref.thumbnailUrl
																: ref.url;
														return (
															<Card
																key={ref._id}
																padding={2}
																radius={2}
																border
																style={{cursor: "pointer"}}
																onClick={() => {
																	const asset = allMedia.find(
																		(m) => m._id === ref._id,
																	);
																	if (asset) onNavigateToMedia(asset);
																}}
															>
																<Flex align="center" gap={3}>
																	<Box
																		style={{
																			width: "48px",
																			height: "48px",
																			borderRadius: "4px",
																			overflow: "hidden",
																			flexShrink: 0,
																			background: "#000",
																			display: "flex",
																			alignItems: "center",
																			justifyContent: "center",
																		}}
																	>
																		{previewUrl ? (
																			<img
																				src={previewUrl}
																				alt={ref.title || "Asset"}
																				style={{
																					width: "100%",
																					height: "100%",
																					objectFit: "cover",
																				}}
																			/>
																		) : ref.assetType === "video" ? (
																			<PlayIcon style={{color: "white"}} />
																		) : (
																			<ImageIcon style={{color: "white"}} />
																		)}
																	</Box>
																	<Stack
																		space={1}
																		style={{flex: 1, minWidth: 0}}
																	>
																		<Flex align="center" gap={2}>
																			{ref.assetType === "video" && (
																				<PlayIcon
																					style={{fontSize: 12, flexShrink: 0}}
																				/>
																			)}
																			<Text
																				size={1}
																				weight="medium"
																				textOverflow="ellipsis"
																			>
																				{ref.title}
																			</Text>
																		</Flex>
																		<Text size={0} muted>
																			{ref.assetType === "video"
																				? "Video (uses as thumbnail)"
																				: "Image asset"}
																		</Text>
																	</Stack>
																</Flex>
															</Card>
														);
													})}
												</Stack>
											</Stack>
										);
									})()}

									{/* Document References */}
									{(() => {
										const docRefs = references.filter((r) => !r.isAsset);
										if (docRefs.length === 0) return null;
										return (
											<Stack space={3}>
												<Text size={1} weight="semibold">
													Documents
												</Text>
												<Text size={0} muted>
													{docRefs.length} document
													{docRefs.length !== 1 ? "s" : ""} using this asset
												</Text>
												<Stack space={2}>
													{docRefs.map((ref) => (
														<IntentLink
															key={ref._id}
															intent="edit"
															params={{id: ref._id, type: ref._type}}
															style={{textDecoration: "none"}}
														>
															<Card
																padding={3}
																radius={2}
																border
																style={{cursor: "pointer"}}
															>
																<Flex align="center" gap={3}>
																	<Box
																		style={{
																			width: "32px",
																			height: "32px",
																			borderRadius: "4px",
																			background: "var(--card-muted-bg-color)",
																			display: "flex",
																			alignItems: "center",
																			justifyContent: "center",
																			flexShrink: 0,
																		}}
																	>
																		<DocumentIcon />
																	</Box>
																	<Stack
																		space={1}
																		style={{flex: 1, minWidth: 0}}
																	>
																		<Text
																			size={1}
																			weight="medium"
																			textOverflow="ellipsis"
																		>
																			{ref.title}
																		</Text>
																		<Text size={0} muted>
																			{ref._type}
																		</Text>
																	</Stack>
																</Flex>
															</Card>
														</IntentLink>
													))}
												</Stack>
											</Stack>
										);
									})()}
								</Stack>
							) : (
								<Card padding={4} radius={2} tone="transparent" border>
									<Stack space={3} style={{textAlign: "center"}}>
										<Text size={1} muted>
											No documents are using this asset
										</Text>
									</Stack>
								</Card>
							)}
						</Box>
					</TabPanel>
				</Box>
			</Card>
		</>
	);
}
