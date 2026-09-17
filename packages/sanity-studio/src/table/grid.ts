import type {Path, PortableTextBlock} from "@portabletext/editor";
import type {SyntheticBehaviorEvent} from "@portabletext/editor/behaviors";

export type Cell = {
	_type: "cell";
	_key: string;
	colSpan?: number;
	value: PortableTextBlock[];
};
export type Row = {_type: "row"; _key: string; cells: Cell[]};
export type Table = {
	_type: "table";
	_key: string;
	headerRows?: number;
	rows: Row[];
};
export type Slot = {
	cell: Cell;
	row: Row;
	rowIndex: number;
	index: number;
	start: number;
	end: number;
};
export type Grid = {rows: Slot[][]; width: number};
export type Edit = SyntheticBehaviorEvent;

export function tableGrid(table: Table): Grid {
	if (!Array.isArray(table.rows) || !table.rows.length)
		throw new Error("A table needs at least one row.");
	const rowKeys = new Set<string>();
	const rows = table.rows.map((row, rowIndex) => {
		if (!row._key || rowKeys.has(row._key))
			throw new Error("Table rows need unique keys.");
		rowKeys.add(row._key);
		if (!Array.isArray(row.cells) || !row.cells.length)
			throw new Error("Each row needs at least one cell.");
		let start = 0;
		const cellKeys = new Set<string>();
		return row.cells.map((cell, index) => {
			if (!cell._key || cellKeys.has(cell._key))
				throw new Error("Row cells need unique keys.");
			cellKeys.add(cell._key);
			const span = cell.colSpan === undefined ? 1 : cell.colSpan;
			if (!Number.isSafeInteger(span) || span < 1)
				throw new Error("Cell spans must be positive integers.");
			if ("rowSpan" in cell && cell.rowSpan !== undefined && cell.rowSpan !== 1)
				throw new Error("Vertical cell spans are not supported.");
			const end = start + span;
			if (!Number.isSafeInteger(end)) throw new Error("The table is too wide.");
			const slot = {cell, row, rowIndex, index, start, end};
			start = end;
			return slot;
		});
	});
	const width = rows[0][rows[0].length - 1].end;
	if (rows.some((row) => row[row.length - 1].end !== width))
		throw new Error("Every row must cover the same number of columns.");
	return {rows, width};
}

export function gridError(value: unknown): string | undefined {
	try {
		tableGrid(value as Table);
	} catch (error) {
		return error instanceof Error ? error.message : "Invalid table.";
	}
	return undefined;
}

export function cellPath(path: Path, slot: Slot): Path {
	return [
		...path,
		"rows",
		{_key: slot.row._key},
		"cells",
		{_key: slot.cell._key},
	];
}

export function emptyCell(key: () => string): Cell {
	return {
		_type: "cell",
		_key: key(),
		value: [
			{
				_type: "block",
				_key: key(),
				style: "normal",
				markDefs: [],
				children: [{_type: "span", _key: key(), text: "", marks: []}],
			},
		],
	};
}

export function cellText(cell: Cell): string {
	return (cell.value ?? [])
		.map((block) =>
			Array.isArray(block.children)
				? block.children
						.map((child) => (typeof child.text === "string" ? child.text : ""))
						.join("")
				: "[Embedded content]",
		)
		.join("\n\n");
}

// Expand until every intersecting horizontal span is fully inside the selection.
export function rectangle(grid: Grid, anchor: Slot, focus: Slot): Slot[] {
	const top = Math.min(anchor.rowIndex, focus.rowIndex);
	const bottom = Math.max(anchor.rowIndex, focus.rowIndex);
	let left = Math.min(anchor.start, focus.start);
	let right = Math.max(anchor.end, focus.end);
	let changed = true;
	while (changed) {
		changed = false;
		for (const row of grid.rows.slice(top, bottom + 1))
			for (const slot of row) {
				if (slot.start < right && slot.end > left) {
					const nextLeft = Math.min(left, slot.start),
						nextRight = Math.max(right, slot.end);
					changed ||= nextLeft !== left || nextRight !== right;
					left = nextLeft;
					right = nextRight;
				}
			}
	}
	return grid.rows
		.slice(top, bottom + 1)
		.flatMap((row) =>
			row.filter((slot) => slot.start >= left && slot.end <= right),
		);
}

export function mergeCells(
	path: Path,
	slots: Slot[],
	key: () => string,
): Edit[] {
	if (
		slots.length < 2 ||
		slots.some(
			(slot, i) =>
				slot.row._key !== slots[0].row._key ||
				(i > 0 && slots[i - 1].end !== slot.start),
		)
	)
		throw new Error("Select adjacent cells in one row.");
	const first = slots[0],
		target = cellPath(path, first);
	const blocks = first.cell.value ?? [];
	const used = new Set(blocks.map((block) => block._key));
	let previous = blocks.at(-1)?._key;
	const edits: Edit[] = [];
	for (const slot of slots.slice(1)) {
		for (const original of slot.cell.value ?? []) {
			let blockKey = original._key;
			while (!blockKey || used.has(blockKey)) blockKey = key();
			used.add(blockKey);
			// Annotation keys are scoped to each block, so preserving the block
			// also preserves its links, marks, lists, and child keys.
			const block =
				blockKey === original._key ? original : {...original, _key: blockKey};
			edits.push({
				type: "insert",
				at: [...target, "value", previous ? {_key: previous} : 0],
				position: previous ? "after" : "before",
				value: block,
			});
			previous = blockKey;
		}
		edits.push({type: "unset", at: cellPath(path, slot)});
	}
	edits.push({
		type: "set",
		at: [...target, "colSpan"],
		value: slots[slots.length - 1].end - first.start,
	});
	edits.push({type: "select.block", at: target, select: "start"});
	return edits;
}

export function splitCell(path: Path, slot: Slot, key: () => string): Edit[] {
	const target = cellPath(path, slot),
		edits: Edit[] = [];
	let previous = target;
	for (let i = 1; i < slot.end - slot.start; i++) {
		const cell = emptyCell(key);
		edits.push({type: "insert", at: previous, position: "after", value: cell});
		previous = [...target.slice(0, -1), {_key: cell._key}];
	}
	edits.push({type: "unset", at: [...target, "colSpan"]});
	edits.push({type: "select.block", at: target, select: "start"});
	return edits;
}

// At a span boundary create a cell; strictly inside a span expand it.
export function insertColumn(
	path: Path,
	grid: Grid,
	boundary: number,
	key: () => string,
): Edit[] {
	if (!Number.isInteger(boundary) || boundary < 0 || boundary > grid.width)
		throw new Error("Invalid column boundary.");
	return grid.rows.map((row): Edit => {
		const covering = row.find(
			(slot) => slot.start < boundary && slot.end > boundary,
		);
		if (covering)
			return {
				type: "set",
				at: [...cellPath(path, covering), "colSpan"],
				value: covering.end - covering.start + 1,
			};
		const after = row.find((slot) => slot.start === boundary);
		return {
			type: "insert",
			at: cellPath(path, after ?? row[row.length - 1]),
			position: after ? "before" : "after",
			value: emptyCell(key),
		};
	});
}

// Removing any covered column keeps a merged cell's key and all its content.
export function deleteColumn(path: Path, grid: Grid, column: number): Edit[] {
	if (
		grid.width < 2 ||
		!Number.isInteger(column) ||
		column < 0 ||
		column >= grid.width
	)
		throw new Error("Keep at least one column.");
	return grid.rows.map((row): Edit => {
		const slot = row.find((slot) => slot.start <= column && slot.end > column);
		if (!slot) throw new Error("Invalid column.");
		const span = slot.end - slot.start;
		return span > 1
			? {type: "set", at: [...cellPath(path, slot), "colSpan"], value: span - 1}
			: {type: "unset", at: cellPath(path, slot)};
	});
}
