import type {ContainerRenderProps} from "@portabletext/editor";
import {useEditor} from "@portabletext/editor";
import {AddIcon} from "@sanity/icons/Add";
import {ArrowDownIcon} from "@sanity/icons/ArrowDown";
import {ArrowLeftIcon} from "@sanity/icons/ArrowLeft";
import {ArrowRightIcon} from "@sanity/icons/ArrowRight";
import {ArrowUpIcon} from "@sanity/icons/ArrowUp";
import {CloseIcon} from "@sanity/icons/Close";
import {CollapseIcon} from "@sanity/icons/Collapse";
import {DragHandleIcon} from "@sanity/icons/DragHandle";
import {EllipsisHorizontalIcon} from "@sanity/icons/EllipsisHorizontal";
import {InsertAboveIcon} from "@sanity/icons/InsertAbove";
import {InsertBelowIcon} from "@sanity/icons/InsertBelow";
import {SplitVerticalIcon} from "@sanity/icons/SplitVertical";
import {ThListIcon} from "@sanity/icons/ThList";
import {
	type ComponentProps,
	type PointerEvent,
	type ReactNode,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	cellRange,
	selectedCells,
	structure,
	type TableCommand,
} from "./behaviors";
import type {Grid, Slot, Table} from "./grid";

type Target = {kind: "row" | "column"; index: number};
type Menu = {
	target: Target | {kind: "table"} | {kind: "cell"; slot: Slot};
	x: number;
	y: number;
	trigger: HTMLElement;
	structure: string;
};
type Drag = Target & {
	x: number;
	y: number;
	boundary: number;
	active: boolean;
	structure: string;
};

type Action = {
	label: string;
	icon: typeof AddIcon;
	run: () => void;
	disabled?: boolean;
	title?: string;
	checked?: boolean;
	divider?: boolean;
	rotate?: boolean;
};

function IconButton({
	icon: Glyph,
	label,
	title = label,
	...props
}: ComponentProps<"button"> & {
	icon: typeof AddIcon;
	label: string;
}) {
	return (
		<button type="button" aria-label={label} title={title} {...props}>
			<Glyph aria-hidden="true" />
		</button>
	);
}

export function TableControls({
	table,
	path,
	grid,
	slots,
	readOnly,
	children,
}: {
	table: Table;
	path: ContainerRenderProps["path"];
	grid: Grid;
	slots: Slot[];
	readOnly?: boolean;
	children: ReactNode;
}) {
	const editor = useEditor();
	const surface = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const toolbarRef = useRef<HTMLFieldSetElement>(null);
	const dragRef = useRef<Drag | null>(null);
	const suppressClick = useRef(false);
	const menuId = useId();
	const [rows, setRows] = useState<{top: number; height: number}[]>([]);
	const [menu, setMenu] = useState<Menu | null>(null);
	const [guide, setGuide] = useState<Target | null>(null);
	const [drag, setDrag] = useState<Drag | null>(null);
	const [message, setMessage] = useState("");
	const currentStructure = structure(table);
	const hasSpans = grid.rows.flat().some((slot) => slot.end - slot.start > 1);
	const first = slots[0];
	const canMerge =
		slots.length > 1 && slots.every((slot) => slot.rowIndex === first.rowIndex);
	const canSplit = slots.length === 1 && first.end - first.start > 1;

	// Reobserve keyed row elements after structural edits.
	useLayoutEffect(() => {
		const element = surface.current?.querySelector("table");
		if (!element) return;
		const measure = () => {
			const top = element.getBoundingClientRect().top;
			const next = Array.from(element.rows, (row) => {
				const rect = row.getBoundingClientRect();
				return {top: rect.top - top, height: rect.height};
			});
			setRows((previous) =>
				JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
			);
		};
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		for (const row of element.rows) observer.observe(row);
		measure();
		return () => observer.disconnect();
	}, [currentStructure]);

	const toolbarRow = first?.rowIndex,
		toolbarColumn = first?.start;
	const toolbarVisible = (canMerge || canSplit) && !menu && !readOnly;
	useLayoutEffect(() => {
		const toolbar = toolbarRef.current,
			element = surface.current;
		if (
			!toolbar ||
			!element ||
			!toolbarVisible ||
			toolbarRow === undefined ||
			toolbarColumn === undefined
		)
			return;
		const place = () => {
			const rect = element.getBoundingClientRect();
			const scroll = element.closest(".scroll")?.getBoundingClientRect();
			const top = rect.top + (rows[toolbarRow]?.top ?? 0);
			const visible = top > 0 && top < window.innerHeight;
			if (!visible) {
				if (toolbar.matches(":popover-open")) toolbar.hidePopover();
				return;
			}
			if (!toolbar.matches(":popover-open")) toolbar.showPopover();
			const width = toolbar.getBoundingClientRect().width;
			toolbar.style.left = `${Math.max(8, scroll?.left ?? 0, Math.min(rect.left + (toolbarColumn / grid.width) * rect.width, (scroll?.right ?? window.innerWidth) - width, window.innerWidth - width - 8))}px`;
			toolbar.style.top = `${Math.max(8, top - (toolbarRow === 0 ? 68 : 40))}px`;
		};
		place();
		window.addEventListener("scroll", place, true);
		window.addEventListener("resize", place);
		return () => {
			window.removeEventListener("scroll", place, true);
			window.removeEventListener("resize", place);
		};
	}, [toolbarVisible, toolbarRow, toolbarColumn, grid.width, rows]);

	useEffect(() => {
		const listener = (event: Event) => {
			if (selectedCells(editor.getSnapshot())?.table._key === table._key)
				setMessage((event as CustomEvent<string>).detail);
		};
		window.addEventListener("tinloof-table-notice", listener);
		return () => window.removeEventListener("tinloof-table-notice", listener);
	}, [editor, table._key]);

	useEffect(() => {
		const cancel = () => {
			dragRef.current = null;
			setDrag(null);
			setGuide(null);
		};
		const keydown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || !dragRef.current) return;
			event.preventDefault();
			event.stopPropagation();
			cancel();
		};
		window.addEventListener("keydown", keydown, true);
		window.addEventListener("blur", cancel);
		return () => {
			window.removeEventListener("keydown", keydown, true);
			window.removeEventListener("blur", cancel);
		};
	}, []);

	useLayoutEffect(() => {
		const element = menuRef.current;
		if (!menu || !element) return;
		// Let the editor finish focusing a newly selected cell before taking focus.
		const frame = requestAnimationFrame(() => {
			element.showPopover();
			const rect = element.getBoundingClientRect();
			element.style.left = `${Math.max(8, Math.min(menu.x, window.innerWidth - rect.width - 8))}px`;
			element.style.top = `${Math.max(8, Math.min(menu.y, window.innerHeight - rect.height - 8))}px`;
			element
				.querySelector<HTMLButtonElement>("button:not(:disabled)")
				?.focus({preventScroll: true});
		});
		return () => cancelAnimationFrame(frame);
	}, [menu]);

	useEffect(() => {
		if (menu && menu.structure !== currentStructure) {
			menuRef.current?.hidePopover();
			setMenu(null);
			setMessage(
				"The table structure changed. Open the row or column options again.",
			);
		}
	}, [menu, currentStructure]);

	useEffect(() => {
		if (!menu) return;
		const close = () => {
			menuRef.current?.hidePopover();
			setMenu(null);
		};

		const outside = (event: globalThis.PointerEvent) => {
			if (
				!menuRef.current?.contains(event.target as Node) &&
				!menu.trigger.contains(event.target as Node)
			)
				close();
		};
		const dismissOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			close();
			menu.trigger.focus({preventScroll: true});
		};
		const controller = new AbortController();
		const options = {signal: controller.signal};
		window.addEventListener("pointerdown", outside, {
			...options,
			capture: true,
		});
		window.addEventListener("keydown", dismissOnEscape, {
			...options,
			capture: true,
		});
		window.addEventListener("blur", close, options);
		window.addEventListener("resize", close, options);
		// Dismiss on user scrolling, not the editor scrolling its new selection into view.
		const scroll = (event: Event) => {
			if (!menuRef.current?.contains(event.target as Node)) close();
		};
		window.addEventListener("wheel", scroll, {...options, capture: true});
		window.addEventListener("touchmove", scroll, {...options, capture: true});
		return () => controller.abort();
	}, [menu]);

	const closeMenu = () => {
		menuRef.current?.hidePopover();
		setMenu(null);
	};
	const send = (
		command: TableCommand,
		expectedStructure = currentStructure,
	) => {
		setMessage("");
		closeMenu();
		editor.send({
			type: "custom.tinloof.table",
			path,
			command,
			expectedStructure,
		});
		editor.send({type: "focus"});
	};
	const openMenu = (
		target: Menu["target"],
		trigger: HTMLElement,
		point?: {x: number; y: number},
	) => {
		const rect = trigger.getBoundingClientRect();
		setMenu({
			target,
			trigger,
			x: point?.x ?? rect.left,
			y: point?.y ?? rect.bottom + 4,
			structure: currentStructure,
		});
	};
	const mergeOrSplit = (kind: "merge" | "split") => {
		if (!first || (kind === "merge" ? !canMerge : !canSplit)) return;
		send(
			kind === "merge"
				? {
						kind,
						rowKey: first.row._key,
						cellKeys: slots.map((slot) => slot.cell._key),
						expected: JSON.stringify(slots.map((slot) => slot.cell)),
					}
				: {
						kind,
						rowKey: first.row._key,
						cellKey: first.cell._key,
						expected: JSON.stringify(first.cell),
					},
		);
	};
	const insertRow = (boundary: number): TableCommand => ({
		kind: "insertRow",
		rowKey: table.rows[Math.min(boundary, table.rows.length - 1)]._key,
		placement: boundary === table.rows.length ? "after" : "before",
	});
	const boundaryTop = (boundary: number) =>
		rows[boundary]?.top ?? (rows.at(-1)?.top ?? 0) + (rows.at(-1)?.height ?? 0);

	const pointerDown = (
		event: PointerEvent<HTMLButtonElement>,
		target: Target,
	) => {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		suppressClick.current = false;
		if (target.kind === "column" && hasSpans) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = {
			...target,
			x: event.clientX,
			y: event.clientY,
			boundary: target.index,
			active: false,
			structure: currentStructure,
		};
	};
	const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
		const start = dragRef.current;
		const rect = surface.current?.getBoundingClientRect();
		if (!start || !rect) return;
		if (
			!start.active &&
			Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5
		)
			return;
		const boundary =
			start.kind === "column"
				? Math.max(
						0,
						Math.min(
							grid.width,
							Math.round(
								(event.clientX - rect.left) / (rect.width / grid.width),
							),
						),
					)
				: rows.filter(
						(row) => event.clientY - rect.top > row.top + row.height / 2,
					).length;
		dragRef.current = {...start, active: true, boundary};
		setDrag(dragRef.current);
		setGuide({kind: start.kind, index: boundary});
		suppressClick.current = true;
		closeMenu();
		const scroll = surface.current?.closest<HTMLElement>(".scroll");
		if (scroll && start.kind === "column") {
			const viewport = scroll.getBoundingClientRect();
			if (event.clientX > viewport.right - 24) scroll.scrollLeft += 12;
			if (event.clientX < viewport.left + 24) scroll.scrollLeft -= 12;
		}
	};
	const cancelDrag = () => {
		dragRef.current = null;
		setDrag(null);
		setGuide(null);
	};
	const pointerUp = (event: PointerEvent<HTMLButtonElement>) => {
		const current = dragRef.current;
		const rect = surface.current?.getBoundingClientRect();
		cancelDrag();
		if (!current?.active || !rect) return;
		if (
			event.clientX < rect.left - 40 ||
			event.clientX > rect.right + 40 ||
			event.clientY < rect.top - 40 ||
			event.clientY > rect.bottom + 40
		)
			return;
		const to =
			current.boundary > current.index
				? current.boundary - 1
				: current.boundary;
		if (to === current.index) return;
		if (current.structure !== currentStructure) {
			setMessage("The table structure changed. Drag the row or column again.");
			return;
		}
		send(
			current.kind === "row"
				? {
						kind: "moveRow",
						rowKey: table.rows[current.index]._key,
						toKey: table.rows[to]._key,
					}
				: {kind: "moveColumn", from: current.index, to},
			current.structure,
		);
	};
	const edgePosition = ({kind, index}: Target, handle: boolean) => {
		if (kind === "column")
			return {
				top: -28,
				left: `calc(${((index + (handle ? 0.5 : 0)) / grid.width) * 100}% - 12px)`,
			};
		return {
			left: -28,
			top:
				boundaryTop(index) + (handle ? (rows[index]?.height ?? 0) / 2 : 0) - 12,
		};
	};
	const handle = (target: Target) => {
		const label = `${target.kind === "row" ? "Row" : "Column"} ${target.index + 1} options`;
		return (
			<IconButton
				icon={DragHandleIcon}
				className="edge-button handle"
				key={`${target.kind}-${target.index}`}
				label={label}
				title={
					target.kind === "column" && hasSpans
						? `${label}. Split merged cells before moving columns.`
						: `${label}. Drag to move.`
				}
				aria-haspopup="menu"
				aria-controls={menuId}
				aria-expanded={
					menu?.target.kind === target.kind &&
					"index" in menu.target &&
					menu.target.index === target.index
				}
				style={edgePosition(target, true)}
				onPointerDown={(event) => pointerDown(event, target)}
				onPointerMove={pointerMove}
				onPointerUp={pointerUp}
				onPointerCancel={cancelDrag}
				onKeyDown={(event) => {
					if (event.key === "Escape") cancelDrag();
				}}
				onClick={(event) => {
					if (suppressClick.current) {
						suppressClick.current = false;
						return;
					}
					openMenu(target, event.currentTarget);
				}}
			/>
		);
	};
	const insert = (target: Target) => {
		const label = `Insert ${target.kind} ${target.index + 1}`;
		return (
			<IconButton
				icon={AddIcon}
				key={`${target.kind}-${target.index}`}
				className="edge-button insert"
				label={label}
				title={label}
				style={edgePosition(target, false)}
				onMouseEnter={() => setGuide(target)}
				onMouseLeave={() => setGuide(null)}
				onFocus={() => setGuide(target)}
				onBlur={() => setGuide(null)}
				onMouseDown={(event) => event.preventDefault()}
				onClick={() => {
					send(
						target.kind === "column"
							? {kind: "insertColumn", boundary: target.index}
							: insertRow(target.index),
					);
					setGuide(null);
				}}
			/>
		);
	};

	const action = (
		label: string,
		icon: typeof AddIcon,
		command: TableCommand,
		options: Partial<Action> = {},
	): Action => ({
		label,
		icon,
		run: () => send(command, menu?.structure),
		...options,
	});
	const axisActions = ({kind, index}: Target): Action[] => {
		const column = kind === "column";
		const count = column ? grid.width : table.rows.length;
		const rowKey = table.rows[index]?._key;
		const directions = column
			? ([
					["left", ArrowLeftIcon],
					["right", ArrowRightIcon],
				] as const)
			: ([
					["up", ArrowUpIcon],
					["down", ArrowDownIcon],
				] as const);
		return [
			...([0, 1] as const).map((offset) =>
				action(
					`Insert ${kind} ${column ? ["before", "after"][offset] : ["above", "below"][offset]}`,
					offset ? InsertBelowIcon : InsertAboveIcon,
					column
						? {kind: "insertColumn", boundary: index + offset}
						: insertRow(index + offset),
					{rotate: column},
				),
			),
			...([-1, 1] as const).map((direction) => {
				const to = index + direction;
				const [label, icon] = directions[direction < 0 ? 0 : 1];
				return action(
					`Move ${kind} ${label}`,
					icon,
					column
						? {kind: "moveColumn", from: index, to}
						: {kind: "moveRow", rowKey, toKey: table.rows[to]?._key},
					{
						disabled: to < 0 || to >= count || (column && hasSpans),
						title:
							column && hasSpans
								? "Split merged cells before moving columns"
								: undefined,
					},
				);
			}),
			action(
				`Delete ${kind}`,
				CloseIcon,
				column
					? {kind: "deleteColumn", column: index}
					: {kind: "deleteRow", rowKey},
				{disabled: count < 2, divider: true},
			),
		];
	};
	const mergeAction: Action = {
		label: canMerge ? "Merge cells" : "Split cell",
		icon: canMerge ? CollapseIcon : SplitVerticalIcon,
		title: canMerge
			? "Merge cells. All content is kept in order."
			: "Split cell. Content stays in the first cell.",
		run: () => mergeOrSplit(canMerge ? "merge" : "split"),
	};
	const target = menu?.target;
	let actions: Action[] = [];
	if (target?.kind === "table") {
		actions = [
			action(
				"Header row",
				ThListIcon,
				{kind: "header"},
				{checked: Boolean(table.headerRows)},
			),
			action("Delete table", CloseIcon, {kind: "deleteTable"}, {divider: true}),
		];
	} else if (target?.kind === "cell") {
		actions = axisActions({kind: "row", index: target.slot.rowIndex});
		if (canMerge || canSplit) {
			actions[0].divider = true;
			actions.unshift(mergeAction);
		}
	} else if (target) actions = axisActions(target);

	const selectedTarget =
		target?.kind === "row" || target?.kind === "column" ? target : null;
	const highlighted = selectedTarget
		? grid.rows
				.flat()
				.filter((slot) =>
					selectedTarget.kind === "row"
						? slot.rowIndex === selectedTarget.index
						: slot.start <= selectedTarget.index &&
							slot.end > selectedTarget.index,
				)
		: slots;
	const top = boundaryTop(
		Math.min(...highlighted.map((slot) => slot.rowIndex)),
	);
	const left =
		selectedTarget?.kind === "column"
			? selectedTarget.index
			: Math.min(...highlighted.map((slot) => slot.start));
	const right =
		selectedTarget?.kind === "column"
			? selectedTarget.index + 1
			: Math.max(...highlighted.map((slot) => slot.end));
	const outline = {
		top,
		left: `${(left / grid.width) * 100}%`,
		width: `${((right - left) / grid.width) * 100}%`,
		height:
			boundaryTop(Math.max(...highlighted.map((slot) => slot.rowIndex)) + 1) -
			top,
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Delegated context menu supplements focusable cell and edge controls.
		<div
			ref={surface}
			className="grid-surface"
			data-dragging={Boolean(drag)}
			onPointerDownCapture={(event) => {
				if (event.button === 2 && !readOnly) {
					event.preventDefault();
					event.stopPropagation();
				}
			}}
			onContextMenu={(event) => {
				if (readOnly || !(event.target instanceof Element)) return;
				const cell = event.target.closest<HTMLElement>("[data-cell-key]");
				const slot = grid.rows
					.flat()
					.find(
						(slot) =>
							slot.cell._key === cell?.dataset.cellKey &&
							slot.row._key === cell?.dataset.rowKey,
					);
				if (!slot || !cell) return;
				event.preventDefault();
				event.stopPropagation();
				if (
					!slots.some(
						(selected) =>
							selected.cell._key === slot.cell._key &&
							selected.row._key === slot.row._key,
					)
				) {
					const range = cellRange(editor.getSnapshot(), path, slot);
					if (range) {
						editor.send({
							type: "select",
							at: {anchor: range.anchor, focus: range.anchor},
						});
					}
				}
				openMenu({kind: "cell", slot}, cell, {
					x: event.clientX,
					y: event.clientY,
				});
			}}
		>
			{children}
			{!readOnly && (
				<>
					<div className="chrome" contentEditable={false}>
						<IconButton
							icon={EllipsisHorizontalIcon}
							className="edge-button table-options"
							label="Table options"
							aria-haspopup="menu"
							aria-expanded={menu?.target.kind === "table"}
							aria-controls={menuId}
							onMouseDown={(event) => event.preventDefault()}
							onClick={(event) =>
								openMenu({kind: "table"}, event.currentTarget)
							}
						/>
						{Array.from({length: grid.width}, (_, index) =>
							handle({kind: "column", index}),
						)}
						{rows.map((_, index) => handle({kind: "row", index}))}
						{Array.from({length: grid.width + 1}, (_, index) =>
							insert({kind: "column", index}),
						)}
						{Array.from({length: rows.length + 1}, (_, index) =>
							insert({kind: "row", index}),
						)}
						{guide && (
							<div
								className="guide"
								data-insertion-guide={guide.kind}
								style={
									guide.kind === "column"
										? {
												top: 0,
												bottom: 0,
												left: `${(guide.index / grid.width) * 100}%`,
												width: 2,
											}
										: {
												left: 0,
												right: 0,
												top: boundaryTop(guide.index),
												height: 2,
											}
								}
							/>
						)}

						{highlighted.length > 0 && (
							<div
								className={selectedTarget ? "target" : "selection-outline"}
								style={outline}
							/>
						)}
					</div>
					{toolbarVisible && (
						<fieldset
							ref={toolbarRef}
							popover="manual"
							contentEditable={false}
							className="selection-tools"
							aria-label="Selected cell actions"
						>
							<IconButton
								icon={mergeAction.icon}
								label={mergeAction.label}
								title={mergeAction.title}
								onMouseDown={(event) => event.preventDefault()}
								onClick={mergeAction.run}
							/>
							<IconButton
								icon={EllipsisHorizontalIcon}
								label="Cell options"
								aria-haspopup="menu"
								aria-controls={menuId}
								onMouseDown={(event) => event.preventDefault()}
								onClick={(event) =>
									openMenu({kind: "cell", slot: first}, event.currentTarget)
								}
							/>
						</fieldset>
					)}
					<div
						ref={menuRef}
						id={menuId}
						popover="manual"
						role="menu"
						aria-orientation="horizontal"
						className="table-menu"
						contentEditable={false}
						aria-label="Table commands"
						onBlurCapture={(event) => {
							if (event.currentTarget.contains(event.relatedTarget as Node))
								return;
							// Selection synchronization can refocus the editable after a context click.
							requestAnimationFrame(() => {
								if (menuRef.current?.matches(":popover-open"))
									menuRef.current
										.querySelector<HTMLButtonElement>("button:not(:disabled)")
										?.focus({preventScroll: true});
							});
						}}
						onKeyDown={(event) => {
							if (event.key === "Tab") {
								closeMenu();
								editor.send({type: "focus"});
								return;
							}
							const step = {
								ArrowLeft: -1,
								ArrowUp: -1,
								ArrowRight: 1,
								ArrowDown: 1,
							}[event.key];
							if (!step && event.key !== "Home" && event.key !== "End") return;
							event.preventDefault();
							const buttons = Array.from(
								event.currentTarget.querySelectorAll<HTMLButtonElement>(
									"button:not(:disabled)",
								),
							);
							const current = buttons.indexOf(
								document.activeElement as HTMLButtonElement,
							);
							const index =
								event.key === "Home"
									? 0
									: event.key === "End"
										? buttons.length - 1
										: (current + (step ?? 0) + buttons.length) % buttons.length;
							buttons[index]?.focus({preventScroll: true});
						}}
					>
						{actions.map((action) => (
							<span className="menu-action" key={action.label}>
								{action.divider && <hr />}
								<IconButton
									icon={action.icon}
									label={action.label}
									title={action.title}
									role={
										action.checked === undefined
											? "menuitem"
											: "menuitemcheckbox"
									}
									aria-checked={action.checked}
									disabled={action.disabled}
									className={action.icon === CloseIcon ? "danger" : undefined}
									style={
										action.rotate ? {transform: "rotate(-90deg)"} : undefined
									}
									onClick={action.run}
								/>
							</span>
						))}
					</div>
					{message && (
						<p className="notice" role="status" contentEditable={false}>
							{message}
						</p>
					)}
				</>
			)}
		</div>
	);
}
