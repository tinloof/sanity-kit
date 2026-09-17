import {
	type ContainerRenderProps,
	defineContainer,
	useEditor,
	useEditorSelector,
} from "@portabletext/editor";
import {BehaviorPlugin, NodePlugin} from "@portabletext/editor/plugins";
import {SquareIcon} from "@sanity/icons/Square";
import {createContext, useContext, useMemo} from "react";
import {cellRange, createTableBehaviors, selectedCells} from "./behaviors";
import {
	cellPath,
	type Grid,
	gridError,
	type Slot,
	type Table,
	tableGrid,
} from "./grid";
import {TableFrame} from "./styles";
import {TableControls} from "./TableControls";
import type {TableMergingOptions} from "./with-table-merging";

const TableContext = createContext<{
	table: Table;
	path: ContainerRenderProps["path"];
	grid?: Grid;
	slots: Slot[];
} | null>(null);

function TableView({
	attributes,
	children,
	node,
	path,
	readOnly,
}: ContainerRenderProps) {
	const table = node as Table;
	const editor = useEditor();
	const selected = useEditorSelector(editor, selectedCells);
	const slots = selected?.table._key === table._key ? selected.slots : [];
	const error = gridError(table),
		grid = error ? undefined : tableGrid(table);
	const content = (
		<TableContext.Provider value={{table, path, grid, slots}}>
			<table>
				<colgroup>
					<col
						span={grid?.width ?? 1}
						style={{width: `${100 / (grid?.width ?? 1)}%`}}
					/>
				</colgroup>
				<tbody>{children}</tbody>
			</table>
		</TableContext.Provider>
	);
	return (
		<div {...attributes}>
			<TableFrame data-tinloof-table>
				{error && (
					<p role="alert" contentEditable={false}>
						{error} Table controls are unavailable until the data is corrected.
					</p>
				)}
				<div className="scroll">
					<div
						className="canvas"
						style={{minWidth: (grid?.width ?? 1) * 160 + 56}}
					>
						{grid ? (
							<TableControls
								table={table}
								path={path}
								grid={grid}
								slots={slots}
								readOnly={readOnly}
							>
								{content}
							</TableControls>
						) : (
							content
						)}
					</div>
				</div>
			</TableFrame>
		</div>
	);
}

function CellView({
	attributes,
	children,
	node,
	path,
	readOnly,
}: ContainerRenderProps) {
	const context = useContext(TableContext),
		editor = useEditor();
	const slot = context?.grid?.rows
		.flat()
		.find(
			(candidate) =>
				JSON.stringify(cellPath(context.path, candidate)) ===
				JSON.stringify(path),
		);
	const Tag =
		slot && slot.rowIndex < (context?.table.headerRows ?? 0) ? "th" : "td";
	const isSelected = context?.slots.some(
		(candidate) =>
			JSON.stringify(cellPath(context.path, candidate)) ===
			JSON.stringify(path),
	);
	return (
		<Tag
			{...attributes}
			contentEditable={context?.grid ? undefined : false}
			colSpan={
				typeof node.colSpan === "number" &&
				Number.isSafeInteger(node.colSpan) &&
				node.colSpan > 0
					? node.colSpan
					: 1
			}
			scope={Tag === "th" ? "col" : undefined}
			data-cell-key={node._key}
			data-row-key={slot?.row._key}
			data-cell-selected={Boolean(isSelected)}
		>
			{slot && context && !readOnly && (
				<button
					type="button"
					className="cell-select"
					title="Select cell. Shift-click to extend selection."
					contentEditable={false}
					aria-label={`Select row ${slot.rowIndex + 1}, column ${slot.start + 1}`}
					aria-pressed={Boolean(isSelected)}
					onMouseDown={(event) => event.preventDefault()}
					onClick={(event) => {
						if (!slot) return;
						const snapshot = editor.getSnapshot(),
							range = cellRange(snapshot, context.path, slot);
						if (!range) return;
						const current = selectedCells(snapshot);
						const anchor =
							event.shiftKey && current?.table._key === context.table._key
								? (snapshot.context.selection?.anchor ?? range.anchor)
								: range.anchor;
						editor.send({type: "focus"});
						editor.send({
							type: "select",
							at: {anchor, focus: event.shiftKey ? range.focus : range.anchor},
						});
					}}
				>
					<SquareIcon aria-hidden="true" />
				</button>
			)}
			{children}
		</Tag>
	);
}

const tableNodes = [
	defineContainer({
		type: "table",
		arrayField: "rows",
		render: (props) => <TableView {...props} />,
		of: [
			defineContainer({
				type: "row",
				arrayField: "cells",
				render: ({attributes, children}) => <tr {...attributes}>{children}</tr>,
				of: [
					defineContainer({
						type: "cell",
						arrayField: "value",
						render: (props) => <CellView {...props} />,
					}),
				],
			}),
		],
	}),
];
export function TablePlugin({clipboardComponents}: TableMergingOptions) {
	const tableBehaviors = useMemo(
		() => createTableBehaviors(clipboardComponents),
		[clipboardComponents],
	);
	return (
		<>
			<NodePlugin nodes={tableNodes} />
			<BehaviorPlugin behaviors={tableBehaviors} />
		</>
	);
}
