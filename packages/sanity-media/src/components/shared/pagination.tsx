import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DoubleChevronLeftIcon,
	DoubleChevronRightIcon,
	EllipsisHorizontalIcon,
} from "@sanity/icons";
import {Button, Flex, Text} from "@sanity/ui";

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

/**
 * Generate page numbers to display with ellipsis for large page counts.
 * Shows: first page, last page, current page, and 1 page on each side of current.
 */
function getPageNumbers(
	currentPage: number,
	totalPages: number,
): (number | "ellipsis")[] {
	if (totalPages <= 7) {
		// Show all pages if 7 or fewer
		return Array.from({length: totalPages}, (_, i) => i + 1);
	}

	const pages: (number | "ellipsis")[] = [];

	// Always show first page
	pages.push(1);

	if (currentPage > 3) {
		pages.push("ellipsis");
	}

	// Pages around current
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	for (let i = start; i <= end; i++) {
		if (!pages.includes(i)) {
			pages.push(i);
		}
	}

	if (currentPage < totalPages - 2) {
		pages.push("ellipsis");
	}

	// Always show last page
	if (!pages.includes(totalPages)) {
		pages.push(totalPages);
	}

	return pages;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const pageNumbers = getPageNumbers(currentPage, totalPages);

	return (
		<Flex justify="center" align="center" gap={2}>
			{/* First page */}
			<Button
				icon={DoubleChevronLeftIcon}
				mode="bleed"
				padding={2}
				disabled={currentPage === 1}
				onClick={() => onPageChange(1)}
				title="First page"
			/>

			{/* Previous page */}
			<Button
				icon={ChevronLeftIcon}
				mode="bleed"
				padding={2}
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
				title="Previous page"
			/>

			{/* Page numbers */}
			<Flex align="center" gap={1}>
				{pageNumbers.map((page, index) =>
					page === "ellipsis" ? (
						<Text key={`ellipsis-${index}`} size={1} muted>
							...
						</Text>
					) : (
						<Button
							key={page}
							mode="bleed"
							padding={2}
							onClick={() => onPageChange(page)}
							style={{
								minWidth: 32,
								background:
									currentPage === page
										? "var(--card-badge-default-bg-color)"
										: undefined,
							}}
						>
							<Text
								size={1}
								muted={currentPage !== page}
								weight={currentPage === page ? "semibold" : "regular"}
								style={{fontVariantNumeric: "tabular-nums"}}
								align="center"
							>
								{page}
							</Text>
						</Button>
					),
				)}
			</Flex>

			{/* Next page */}
			<Button
				icon={ChevronRightIcon}
				mode="bleed"
				padding={2}
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(currentPage + 1)}
				title="Next page"
			/>

			{/* Last page */}
			<Button
				icon={DoubleChevronRightIcon}
				mode="bleed"
				padding={2}
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(totalPages)}
				title="Last page"
			/>
		</Flex>
	);
}
