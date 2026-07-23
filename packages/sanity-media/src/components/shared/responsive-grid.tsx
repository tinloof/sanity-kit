import {Box} from "@sanity/ui";
import type {ReactNode} from "react";

export interface ResponsiveGridProps {
	children: ReactNode;
	/** Gap between grid items in Sanity UI space units */
	gap?: number;
	/** Class name for the grid container */
	className?: string;
}

/**
 * A responsive grid that adapts based on container width (not viewport width).
 * Uses CSS container queries for true container-based responsiveness.
 */
export function ResponsiveGrid({
	children,
	gap = 3,
	className,
}: ResponsiveGridProps) {
	// Convert Sanity UI gap units to pixels (1 unit = 4px in Sanity UI)
	const gapPx = gap * 4;

	return (
		<>
			<style>
				{`
					.responsive-grid-container {
						container-type: inline-size;
					}
					.responsive-grid {
						display: grid;
						grid-template-columns: repeat(1, 1fr);
						gap: ${gapPx}px;
					}
					/* 2 columns when container is >= 320px */
					@container (min-width: 320px) {
						.responsive-grid {
							grid-template-columns: repeat(2, 1fr);
						}
					}
					/* 3 columns when container is >= 480px */
					@container (min-width: 480px) {
						.responsive-grid {
							grid-template-columns: repeat(3, 1fr);
						}
					}
					/* 4 columns when container is >= 640px */
					@container (min-width: 640px) {
						.responsive-grid {
							grid-template-columns: repeat(4, 1fr);
						}
					}
					/* 5 columns when container is >= 800px */
					@container (min-width: 800px) {
						.responsive-grid {
							grid-template-columns: repeat(5, 1fr);
						}
					}
					/* 6 columns when container is >= 960px */
					@container (min-width: 960px) {
						.responsive-grid {
							grid-template-columns: repeat(6, 1fr);
						}
					}
				`}
			</style>
			<Box className={`responsive-grid-container ${className || ""}`}>
				<div className="responsive-grid">{children}</div>
			</Box>
		</>
	);
}
