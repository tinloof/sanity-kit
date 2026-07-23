import {Box, Flex} from "@sanity/ui";
import {useCallback, useEffect, useRef, useState} from "react";
import type {Tag} from "../media-panel/types";
import {TAG_COLORS} from "../media-panel/types";

interface TagListProps {
	tagRefs: Array<{_ref: string}>;
	tags: Tag[];
}

export function TagList({tagRefs, tags}: TagListProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLDivElement>(null);
	const [visibleCount, setVisibleCount] = useState(tagRefs.length);

	const calculateVisibleTags = useCallback(() => {
		const container = containerRef.current;
		const measureContainer = measureRef.current;
		if (!container || !measureContainer) return;

		const containerWidth = container.offsetWidth;
		const tagElements = measureContainer.children;
		const gap = 4; // gap={1} = 4px
		const plusBadgeWidth = 24; // approximate width for "+N" badge

		let totalWidth = 0;
		let count = 0;

		for (let i = 0; i < tagElements.length; i++) {
			const tagWidth = (tagElements[i] as HTMLElement).offsetWidth;
			const widthWithGap = totalWidth + tagWidth + (count > 0 ? gap : 0);

			// Check if this tag fits, accounting for potential +N badge
			const remainingTags = tagRefs.length - (count + 1);
			const needsPlusBadge = remainingTags > 0;
			const requiredWidth = needsPlusBadge ? widthWithGap + gap + plusBadgeWidth : widthWithGap;

			if (requiredWidth <= containerWidth) {
				totalWidth = widthWithGap;
				count++;
			} else {
				break;
			}
		}

		// Ensure at least 1 tag shows if there are any
		setVisibleCount(Math.max(1, count));
	}, [tagRefs.length]);

	useEffect(() => {
		calculateVisibleTags();

		const container = containerRef.current;
		if (!container) return;

		const resizeObserver = new ResizeObserver(() => {
			calculateVisibleTags();
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, [calculateVisibleTags]);

	const resolvedTags = tagRefs
		.map((ref) => tags.find((t) => t._id === ref._ref))
		.filter((t): t is Tag => t !== undefined);

	if (resolvedTags.length === 0) return null;

	const visibleTags = resolvedTags.slice(0, visibleCount);
	const hiddenCount = resolvedTags.length - visibleCount;

	return (
		<>
			{/* Hidden container for measuring all tags */}
			<div
				ref={measureRef}
				style={{
					position: "absolute",
					visibility: "hidden",
					display: "flex",
					gap: "4px",
					pointerEvents: "none",
				}}
			>
				{resolvedTags.map((tag) => {
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
								whiteSpace: "nowrap",
							}}
						>
							{tag.name}
						</Box>
					);
				})}
			</div>

			{/* Visible container */}
			<Flex ref={containerRef} gap={1} style={{overflow: "hidden"}}>
				{visibleTags.map((tag) => {
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
								flexShrink: 0,
								whiteSpace: "nowrap",
							}}
						>
							{tag.name}
						</Box>
					);
				})}
				{hiddenCount > 0 && (
					<Box
						style={{
							background: "var(--card-muted-bg-color)",
							padding: "2px 6px",
							borderRadius: "3px",
							fontSize: "10px",
							fontWeight: 500,
							flexShrink: 0,
							whiteSpace: "nowrap",
						}}
					>
						+{hiddenCount}
					</Box>
				)}
			</Flex>
		</>
	);
}
