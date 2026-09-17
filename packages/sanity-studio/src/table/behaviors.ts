import type {EditorSnapshot, Path} from "@portabletext/editor";
import {
	type Behavior,
	defineBehavior,
	effect,
	raise,
} from "@portabletext/editor/behaviors";
import {
	isActiveAnnotation,
	isActiveDecorator,
	isActiveListItem,
	isActiveStyle,
	isSelectionCollapsed,
} from "@portabletext/editor/selectors";
import {getEnclosingBlock} from "@portabletext/editor/traversal";
import {
	getBlockEndPoint,
	getBlockStartPoint,
	isEqualPaths,
} from "@portabletext/editor/utils";
import {defineTable} from "@portabletext/plugin-table";
import type {PortableTextComponents} from "@portabletext/react";
import {
	cellPath,
	cellText,
	deleteColumn,
	emptyCell,
	type Grid,
	gridError,
	insertColumn,
	mergeCells,
	rectangle,
	type Slot,
	splitCell,
	type Table,
	tableGrid,
} from "./grid";

import {clipboardTableHtml} from "./rich-text";

export const nativeTable = defineTable();
export type Position = {table: Table; path: Path; grid: Grid; slot: Slot};
export function position(
	snapshot: EditorSnapshot,
	path?: Path,
): Position | undefined {
	if (!path) return;
	const entry = getEnclosingBlock(snapshot, path, {
		match: (node) => node._type === "table",
	});
	if (!entry) return;
	const table = entry.node as Table;
	try {
		const grid = tableGrid(table);
		const slot = grid.rows.flat().find((slot) => {
			const candidate = cellPath(entry.path, slot);
			return isEqualPaths(candidate, path.slice(0, candidate.length));
		});
		if (slot) return {table, path: entry.path, grid, slot};
	} catch {
		/* Invalid imported grids stay visible but cannot be structurally edited. */
	}
	return undefined;
}
export function selectedCells(snapshot: EditorSnapshot) {
	const selection = snapshot.context.selection;
	const anchor = position(snapshot, selection?.anchor.path),
		focus = position(snapshot, selection?.focus.path);
	if (!anchor || !focus || !isEqualPaths(anchor.path, focus.path)) return;
	return {...anchor, slots: rectangle(anchor.grid, anchor.slot, focus.slot)};
}
export function cellRange(snapshot: EditorSnapshot, path: Path, slot: Slot) {
	const first = slot.cell.value?.[0],
		last = slot.cell.value?.at(-1);
	if (!first || !last) return;
	return {
		anchor: getBlockStartPoint({
			context: snapshot.context,
			block: {
				node: first,
				path: [...cellPath(path, slot), "value", {_key: first._key}],
			},
		}),
		focus: getBlockEndPoint({
			context: snapshot.context,
			block: {
				node: last,
				path: [...cellPath(path, slot), "value", {_key: last._key}],
			},
		}),
	};
}

export type TableCommand =
	| {kind: "merge"; rowKey: string; cellKeys: string[]; expected: string}
	| {kind: "split"; rowKey: string; cellKey: string; expected: string}
	| {kind: "insertColumn"; boundary: number}
	| {kind: "deleteColumn"; column: number}
	| {kind: "insertRow"; rowKey: string; placement: "before" | "after"}
	| {kind: "deleteRow"; rowKey: string}
	| {kind: "header"}
	| {kind: "deleteTable"}
	| {kind: "moveRow"; rowKey: string; toKey: string}
	| {kind: "moveColumn"; from: number; to: number};

// Sent by the controls and checked against a fresh editor snapshot at execution.
const commandBehavior = defineBehavior<
	{path: Path; command: TableCommand; expectedStructure: string},
	"custom.tinloof.table"
>({
	on: "custom.tinloof.table",
	guard: ({snapshot}) => !snapshot.context.readOnly,
	actions: [
		({snapshot, event}) => {
			const entry = getEnclosingBlock(snapshot, event.path, {
				match: (node) => node._type === "table",
			});
			if (!entry) return [];
			const table = entry.node as Table,
				path = entry.path,
				command = event.command;
			let grid: Grid;
			try {
				grid = tableGrid(table);
			} catch {
				return [];
			}
			if (structure(table) !== event.expectedStructure)
				return [
					notice(
						"The table structure changed. Select the cells or column again.",
					),
				];
			const key = snapshot.context.keyGenerator;
			switch (command.kind) {
				case "merge": {
					const slots = grid.rows
						.flat()
						.filter(
							(slot) =>
								slot.row._key === command.rowKey &&
								command.cellKeys.includes(slot.cell._key),
						);
					if (
						slots.length !== command.cellKeys.length ||
						JSON.stringify(slots.map((slot) => slot.cell)) !== command.expected
					)
						return [
							notice(
								"The selected cells changed. Select them again before merging.",
							),
						];
					try {
						return mergeCells(path, slots, key).map(raise);
					} catch {
						return [notice("Select adjacent cells in one row.")];
					}
				}
				case "split": {
					const slot = grid.rows
						.flat()
						.find(
							(slot) =>
								slot.row._key === command.rowKey &&
								slot.cell._key === command.cellKey,
						);
					if (!slot || JSON.stringify(slot.cell) !== command.expected)
						return [
							notice("The cell changed. Select it again before splitting."),
						];
					return splitCell(path, slot, key).map(raise);
				}
				case "insertColumn":
					return command.boundary >= 0 && command.boundary <= grid.width
						? insertColumn(path, grid, command.boundary, key).map(raise)
						: [];
				case "deleteColumn": {
					if (
						grid.width <= 1 ||
						command.column < 0 ||
						command.column >= grid.width
					)
						return [];
					const edits = deleteColumn(path, grid, command.column).map(raise);
					const current = position(
						snapshot,
						snapshot.context.selection?.focus.path,
					);
					if (
						current &&
						isEqualPaths(current.path, path) &&
						current.slot.start === command.column &&
						current.slot.end - current.slot.start === 1
					) {
						const neighbor =
							grid.rows[current.slot.rowIndex].find(
								(slot) =>
									slot.cell._key !== current.slot.cell._key &&
									slot.end > command.column,
							) ??
							grid.rows[current.slot.rowIndex].find(
								(slot) => slot.start < command.column,
							);
						if (neighbor)
							edits.push(
								raise({
									type: "select.block",
									at: cellPath(path, neighbor),
									select: "start",
								}),
							);
					}
					return edits;
				}
				case "insertRow": {
					if (!table.rows.some((row) => row._key === command.rowKey)) return [];
					return [
						raise({
							type: "insert",
							at: [...path, "rows", {_key: command.rowKey}],
							position: command.placement,
							value: {
								_type: "row",
								_key: key(),
								cells: Array.from({length: grid.width}, () => emptyCell(key)),
							},
						}),
					];
				}
				case "deleteRow": {
					if (
						table.rows.length <= 1 ||
						!table.rows.some((row) => row._key === command.rowKey)
					)
						return [];
					const neighbor = grid.rows.find(
						(row) => row[0].row._key !== command.rowKey,
					)?.[0];
					if (!neighbor) return [];
					return [
						raise({
							type: "unset",
							at: [...path, "rows", {_key: command.rowKey}],
						}),
						raise({
							type: "select.block",
							at: cellPath(path, neighbor),
							select: "start",
						}),
					];
				}
				case "deleteTable":
					return [raise({type: "custom.unset.table", at: path})];
				case "header":
					return [
						raise({
							type: "set",
							at: [...path, "headerRows"],
							value: table.headerRows ? 0 : 1,
						}),
					];
				case "moveRow":
					return [
						raise({
							type: "move.block",
							at: [...path, "rows", {_key: command.rowKey}],
							to: [...path, "rows", {_key: command.toKey}],
						}),
					];
				case "moveColumn": {
					if (grid.rows.flat().some((slot) => slot.end - slot.start > 1))
						return [notice("Split merged cells before reordering columns.")];
					return grid.rows.flatMap((row) =>
						row[command.from] && row[command.to]
							? [
									raise({
										type: "move.block",
										at: cellPath(path, row[command.from]),
										to: cellPath(path, row[command.to]),
									}),
								]
							: [],
					);
				}
			}
		},
	],
});

function notice(message: string) {
	return effect(() => {
		window.dispatchEvent(
			new CustomEvent("tinloof-table-notice", {detail: message}),
		);
	});
}

// A linear selection crossing a merged table boundary is not a grid operation.
const protectTableBoundary = (
	["delete", "split", "insert.text", "clipboard.paste"] as const
).map((on) =>
	defineBehavior({
		on,
		guard: ({snapshot, event}) => {
			if ("at" in event && event.at) return false;
			const selection = snapshot.context.selection;
			const anchor = position(snapshot, selection?.anchor.path),
				focus = position(snapshot, selection?.focus.path);
			if (anchor && focus && isEqualPaths(anchor.path, focus.path))
				return false;
			return [anchor, focus].some((entry) =>
				entry?.grid.rows.flat().some((slot) => slot.end - slot.start > 1),
			);
		},
		actions: [
			() => [
				notice(
					"Select cells within one table, or use Delete table to remove the whole table.",
				),
			],
		],
	}),
);

const clearSelection = (["delete", "split"] as const).map((on) =>
	defineBehavior({
		on,
		guard: ({snapshot, event}) => {
			if ("at" in event && event.at) return false;
			const selection = selectedCells(snapshot);
			return selection && selection.slots.length > 1 ? selection : false;
		},
		actions: [
			(_, {path, slots}) => [
				...slots.flatMap((slot) =>
					slot.cell.value.map((block) =>
						raise({
							type: "unset",
							at: [...cellPath(path, slot), "value", {_key: block._key}],
						}),
					),
				),
				raise({
					type: "select.block",
					at: cellPath(path, slots[0]),
					select: "start",
				}),
			],
		],
	}),
);

const verticalNavigation = defineBehavior({
	on: "keyboard.keydown",
	guard: ({snapshot, event, dom}) => {
		const key = event.originEvent;
		if (
			!["ArrowUp", "ArrowDown"].includes(key.key) ||
			key.shiftKey ||
			key.altKey ||
			key.ctrlKey ||
			key.metaKey ||
			!isSelectionCollapsed(snapshot)
		)
			return false;
		const current = position(snapshot, snapshot.context.selection?.focus.path);
		if (!current) return false;
		const down = key.key === "ArrowDown",
			range = cellRange(snapshot, current.path, current.slot);
		if (!range) return false;
		const point = down ? range.focus : range.anchor;
		const edge = dom.getSelectionRect({
			...snapshot,
			context: {...snapshot.context, selection: {anchor: point, focus: point}},
		});
		const caret = dom.getSelectionRect(snapshot);
		if (!edge || !caret || caret.top >= edge.bottom || caret.bottom <= edge.top)
			return false;
		const row = current.grid.rows[current.slot.rowIndex + (down ? 1 : -1)];
		if (!row) return false; // Native table-edge escape remains valid.
		const target = row.find(
			(slot) =>
				slot.start <= current.slot.start && slot.end > current.slot.start,
		);
		if (!target) return false;
		const targetRange = cellRange(snapshot, current.path, target);
		if (!targetRange) return false;
		const fallback = down ? targetRange.anchor : targetRange.focus;
		const line = dom.getSelectionRect({
			...snapshot,
			context: {
				...snapshot.context,
				selection: {anchor: fallback, focus: fallback},
			},
		});
		const hit =
			line &&
			dom.getPointAtCoordinates({x: caret.left, y: line.top + line.height / 2});
		const resolvedHit = hit && position(snapshot, hit.path);
		return {
			point:
				hit && resolvedHit?.slot.cell._key === target.cell._key
					? hit
					: fallback,
		};
	},
	actions: [
		(_, {point}) => [
			raise({type: "select", at: {anchor: point, focus: point}}),
		],
	],
});

const scaffold = defineBehavior({
	on: "insert.block",
	guard: ({event}) =>
		event.block._type === "table" &&
		(!("rows" in event.block) ||
			!Array.isArray(event.block.rows) ||
			event.block.rows.length === 0),
	actions: [
		({event}) => [
			raise({
				...event,
				block: {...event.block, ...nativeTable.createBlock({headerRows: 1})},
			}),
		],
	],
});

// A table fragment cannot yet be distributed safely across merged targets.
// Text and rich-text paste inside a single cell still use the native engine.
const clipboardGuard = defineBehavior({
	on: "clipboard.paste",
	guard: ({snapshot, event}) => {
		const selected = selectedCells(snapshot);
		if (!selected) return false;
		const data = event.originEvent.dataTransfer;
		const structured = data.getData("application/x-portable-text");
		const hasSpans = selected.grid.rows
			.flat()
			.some((slot) => slot.end - slot.start > 1);
		const html = new DOMParser().parseFromString(
			data.getData("text/html"),
			"text/html",
		);
		const htmlSpans = Array.from(html.querySelectorAll("td, th")).some((cell) =>
			["colspan", "rowspan"].some(
				(attribute) =>
					cell.hasAttribute(attribute) &&
					Number(cell.getAttribute(attribute)) !== 1,
			),
		);
		let tableFragment = false,
			fragmentSpans = false;
		try {
			const blocks: unknown = JSON.parse(structured || "[]");
			if (Array.isArray(blocks))
				for (const block of blocks) {
					if (block?._type !== "table") continue;
					tableFragment = true;
					if (gridError(block)) {
						fragmentSpans = true;
						continue;
					}
					fragmentSpans ||= tableGrid(block)
						.rows.flat()
						.some((slot) => slot.end - slot.start > 1);
				}
		} catch {
			/* The editor handles malformed non-table clipboard content. */
		}
		return (
			htmlSpans ||
			fragmentSpans ||
			(hasSpans &&
				(selected.slots.length > 1 ||
					tableFragment ||
					Boolean(html.querySelector("table"))))
		);
	},
	actions: [
		() => [
			notice(
				"Paste text into one cell. Pasting a table or across multiple cells is not supported yet.",
			),
		],
	],
});

const blockTableDrag = defineBehavior({
	on: "drag.*",
	guard: ({snapshot, event}) =>
		Boolean(
			selectedCells(snapshot) ||
				("position" in event &&
					position(snapshot, event.position.selection.focus.path)),
		),
	actions: [
		() => [notice("Use the row and column controls to reorder this table.")],
	],
});

const formats = (
	[
		"decorator.toggle",
		"decorator.add",
		"decorator.remove",
		"annotation.toggle",
		"annotation.add",
		"annotation.remove",
		"style.toggle",
		"style.add",
		"style.remove",
		"list item.toggle",
		"list item.add",
		"list item.remove",
	] as const
).map((on) =>
	defineBehavior({
		on,
		guard: ({snapshot, event}) => {
			if ("at" in event && event.at) return false;
			const selected = selectedCells(snapshot);
			return selected && selected.slots.length > 1 ? selected : false;
		},
		actions: [
			({snapshot, event}, {path, slots}) => {
				const ranges = slots.flatMap((slot) => {
					const range = cellRange(snapshot, path, slot);
					return range ? [range] : [];
				});
				const active =
					"decorator" in event
						? isActiveDecorator(event.decorator)
						: "annotation" in event
							? isActiveAnnotation(event.annotation.name)
							: "style" in event
								? isActiveStyle(event.style)
								: isActiveListItem(event.listItem);
				const remove =
					event.type.endsWith(".remove") ||
					(event.type.endsWith(".toggle") &&
						ranges.every((range) =>
							active({
								...snapshot,
								context: {...snapshot.context, selection: range},
							}),
						));
				if ("decorator" in event)
					return ranges.map((at) =>
						raise({
							type: remove ? "decorator.remove" : "decorator.add",
							decorator: event.decorator,
							at,
						}),
					);
				if ("annotation" in event)
					return ranges
						.filter(
							(range) =>
								remove ||
								!active({
									...snapshot,
									context: {...snapshot.context, selection: range},
								}),
						)
						.map((at) =>
							remove
								? raise({
										type: "annotation.remove",
										annotation: {name: event.annotation.name},
										at,
									})
								: raise({
										type: "annotation.add",
										annotation: {
											...event.annotation,
											value:
												"value" in event.annotation
													? event.annotation.value
													: {},
										},
										at,
									}),
						);
				return slots.flatMap((slot) =>
					slot.cell.value
						.filter((block) => block._type === "block")
						.map((block) => {
							const at = [...cellPath(path, slot), "value", {_key: block._key}];
							if ("style" in event)
								return raise({
									type: "block.set",
									at,
									props: {style: remove ? "normal" : event.style},
								});
							return remove
								? raise({type: "block.unset", at, props: ["listItem", "level"]})
								: raise({
										type: "block.set",
										at,
										props: {listItem: event.listItem, level: block.level ?? 1},
									});
						}),
				);
			},
		],
	}),
);

const serialize = (components?: Partial<PortableTextComponents>) =>
	defineBehavior({
		on: "serialize.data",
		guard: ({snapshot, event}) => {
			if (event.originEvent.type === "drag.dragstart") return false;
			const selected = selectedCells(snapshot);
			return selected && selected.slots.length > 1 ? selected : false;
		},
		actions: [
			({event}, {table, slots}) => {
				const rows = table.rows
					.filter((row) => slots.some((slot) => slot.row === row))
					.map((row) => ({
						...row,
						cells: slots
							.filter((slot) => slot.row === row)
							.map((slot) => slot.cell),
					}));
				const fragment = {
					...table,
					rows,
					headerRows: slots[0].rowIndex === 0 ? table.headerRows : 0,
				};
				if (event.mimeType === "text/plain")
					return [
						raise({
							type: "serialization.success",
							mimeType: event.mimeType,
							originEvent: event.originEvent,
							data: rows
								.map((row) =>
									row.cells
										.flatMap((cell) => [
											cellText(cell),
											...Array.from(
												{length: (cell.colSpan ?? 1) - 1},
												() => "",
											),
										])
										.join("\t"),
								)
								.join("\n"),
						}),
					];
				if (event.mimeType === "application/x-portable-text")
					return [
						raise({
							type: "serialization.success",
							mimeType: event.mimeType,
							originEvent: event.originEvent,
							data: JSON.stringify([fragment]),
						}),
					];
				if (event.mimeType === "text/html")
					return [
						raise({
							type: "serialization.success",
							mimeType: event.mimeType,
							originEvent: event.originEvent,
							data: clipboardTableHtml(fragment, components),
						}),
					];
				return [];
			},
		],
	});

// These physical-index commands are replaced by the logical-grid controls.
const replaced = new Set([
	"custom.insert.row",
	"custom.insert.column",
	"custom.unset.row",
	"custom.unset.column",
	"custom.move.row",
	"custom.move.column",
	"serialize.data",
	"delete",
	"split",
]);
export const createTableBehaviors = (
	components?: Partial<PortableTextComponents>,
): Behavior[] => [
	commandBehavior,
	scaffold,
	...protectTableBoundary,
	...clearSelection,
	verticalNavigation,
	clipboardGuard,
	blockTableDrag,
	...formats,
	serialize(components),
	...nativeTable.behaviors.filter((behavior) => !replaced.has(behavior.on)),
];

export function structure(table: Table): string {
	return JSON.stringify(
		table.rows.map((row) => [
			row._key,
			row.cells.map((cell) => [cell._key, cell.colSpan ?? 1]),
		]),
	);
}
