import {SearchIcon} from "@sanity/icons/Search";
import {Button, Flex, Stack, Text, TextInput} from "@sanity/ui";
import React from "react";
import {
	type ArrayOfObjectsInputProps,
	defineArrayMember,
	defineField,
} from "sanity";

const REDIRECT_STATUS = {
	PERMANENT: "permanent",
	TEMPORARY: "temporary",
} as const;

const BOOLEAN_VALUES = {
	TRUE: "true",
	FALSE: "false",
} as const;

const PAGE_SIZE = 50;

const SEARCH_PLACEHOLDER =
	"Search redirects by source, destination, or status...";

// Helper functions
function getRedirectStatus(permanent: boolean): string {
	return permanent ? REDIRECT_STATUS.PERMANENT : REDIRECT_STATUS.TEMPORARY;
}

function getBooleanString(permanent: boolean): string {
	return permanent ? BOOLEAN_VALUES.TRUE : BOOLEAN_VALUES.FALSE;
}

function matchesSearch(
	item: {
		_key: string;
		source?: unknown;
		destination?: unknown;
		permanent?: unknown;
	},
	search: string,
): boolean {
	if (typeof item.source !== "string" || typeof item.destination !== "string") {
		return false;
	}

	const searchLower = search.toLowerCase();
	return (
		item.source.toLowerCase().includes(searchLower) ||
		item.destination.toLowerCase().includes(searchLower) ||
		getRedirectStatus(Boolean(item.permanent)).includes(searchLower) ||
		getBooleanString(Boolean(item.permanent)).includes(searchLower)
	);
}

export default defineField({
	name: "redirects",
	title: "Redirects",
	description:
		"Configure URL redirects to automatically send visitors from old URLs to new ones. For handling moved pages, changed URLs, or temporary redirects.",
	type: "array",
	options: {
		layout: "list",
	},
	components: {
		input: ArrayInput,
	},
	of: [
		defineArrayMember({
			name: "redirect",
			title: "Redirect",
			type: "object",
			fields: [
				defineField({
					name: "source",
					title: "Source path",
					description:
						"The original URL path that visitors are trying to access on this site (must start with /)",
					type: "string",
					placeholder: "/old-page",
					validation: (Rule) =>
						Rule.required()
							.min(2)
							.custom((value) => {
								if (!value) return "Source path is required";
								if (!value.startsWith("/")) {
									return "Source path must start with a forward slash (/)";
								}
								if (value === "/") {
									return "Source path cannot be just a forward slash";
								}
								return true;
							}),
				}),
				defineField({
					name: "destination",
					title: "Destination URL",
					description:
						"Where visitors should be redirected to (can be a path like /new-page or a full URL like https://example.com)",
					type: "string",
					placeholder: "/new-page or https://example.com/new-page",
					validation: (Rule) =>
						Rule.required()
							.min(1)
							.custom((value) => {
								if (!value) return "Destination URL is required";
								if (value.startsWith("/")) return true;

								try {
									const url = new URL(value);
									if (!url.hostname || url.hostname.length === 0) {
										return "Please enter a valid URL with a hostname (e.g., https://example.com) or a path starting with /";
									}
									// Check for valid hostname pattern (at least one dot or localhost)
									if (
										!url.hostname.includes(".") &&
										url.hostname !== "localhost"
									) {
										return "Please enter a valid URL with a proper hostname (e.g., https://example.com) or a path starting with /";
									}
									return true;
								} catch {
									return "Please enter a valid URL (e.g., https://example.com) or a path starting with /";
								}
							}),
				}),
				defineField({
					name: "permanent",
					title: "Permanent redirect",
					description:
						"Permanent redirects tell browsers and search engines this change is permanent. Use temporary for testing or when you might change the destination later.",
					initialValue: true,
					type: "boolean",
					validation: (Rule) => Rule.required(),
				}),
			],

			preview: {
				prepare({destination, permanent, source}) {
					return {
						media: <div>{permanent ? "P" : "T"}</div>,
						subtitle: `Redirects to: ${destination}`,
						title: `${source} →`,
					};
				},
				select: {
					destination: "destination",
					permanent: "permanent",
					source: "source",
				},
			},
		}),
	],
});

function ArrayInput({members, ...props}: ArrayOfObjectsInputProps) {
	const [search, setSearch] = React.useState("");
	const [page, setPage] = React.useState(0);
	const itemMembers = members.filter((member) => member.kind === "item");
	const filteredMembers = itemMembers.filter(
		(member) => !search || matchesSearch(member.item.value, search),
	);
	const focusSegment = props.focusPath[0];
	const isActive = (member: (typeof itemMembers)[number]) =>
		member.open ||
		member.item.focused ||
		(typeof focusSegment === "object" && "_key" in focusSegment
			? member.key === focusSegment._key
			: member.index === focusSegment);
	const activeMember =
		itemMembers.find((member) => member.open) || itemMembers.find(isActive);

	// Follow newly opened/focused items, including Sanity's append and insert actions.
	// Keep active items mounted below while their fields or the search are changing.
	React.useEffect(() => {
		if (!activeMember) return;
		const index = filteredMembers.indexOf(activeMember);
		if (index < 0) {
			setSearch("");
			setPage(Math.floor(itemMembers.indexOf(activeMember) / PAGE_SIZE));
		} else {
			setPage(Math.floor(index / PAGE_SIZE));
		}
	}, [activeMember?.key]);

	const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount - 1);
	React.useEffect(() => {
		if (page !== currentPage) setPage(currentPage);
	}, [page, currentPage]);
	const start = currentPage * PAGE_SIZE;
	const pageMembers = filteredMembers.slice(start, start + PAGE_SIZE);
	const visibleMembers = members.filter(
		(member) =>
			member.kind !== "item" ||
			pageMembers.includes(member) ||
			isActive(member),
	);
	const activeOutsidePage = visibleMembers.filter(
		(member) => member.kind === "item" && !pageMembers.includes(member),
	).length;
	const filteredCount = filteredMembers.length;
	const totalCount = itemMembers.length;

	const handleMove: ArrayOfObjectsInputProps["onItemMove"] = (event) => {
		const from = visibleMembers[event.fromIndex];
		const to = visibleMembers[event.toIndex];
		if (props.readOnly || !from || !to) return;
		// Sanity's sortable list reports visible positions, not original array indexes.
		props.onItemMove({fromIndex: from.index, toIndex: to.index});
	};

	return (
		<Stack gap={3}>
			<TextInput
				aria-label="Search redirects"
				onChange={(event) => {
					setSearch(event.currentTarget.value);
					setPage(0);
				}}
				placeholder={SEARCH_PLACEHOLDER}
				type="text"
				value={search}
				icon={SearchIcon}
			/>
			<Flex align="center" justify="space-between" gap={3} wrap="wrap">
				<Text size={1} muted aria-live="polite">
					{filteredCount === 0
						? search
							? "No redirects match your search"
							: "No redirects"
						: `Showing ${start + 1}-${Math.min(start + PAGE_SIZE, filteredCount)} of ${filteredCount} redirect${filteredCount === 1 ? "" : "s"}${search ? ` (${totalCount} total)` : ""}`}
				</Text>
				<Flex align="center" gap={2}>
					<Button
						aria-label="Previous page of redirects"
						text="Previous"
						mode="ghost"
						disabled={currentPage === 0}
						onClick={() => setPage(currentPage - 1)}
					/>
					<Text size={1}>
						Page {currentPage + 1} of {pageCount}
					</Text>
					<Button
						aria-label="Next page of redirects"
						text="Next"
						mode="ghost"
						disabled={currentPage === pageCount - 1}
						onClick={() => setPage(currentPage + 1)}
					/>
				</Flex>
			</Flex>
			{activeOutsidePage > 0 && (
				<Text size={1} muted>
					{activeOutsidePage} active redirect
					{activeOutsidePage === 1 ? "" : "s"} kept visible outside these
					results.
				</Text>
			)}
			{props.renderDefault({
				...props,
				members: visibleMembers,
				onItemMove: handleMove,
			})}
		</Stack>
	);
}
