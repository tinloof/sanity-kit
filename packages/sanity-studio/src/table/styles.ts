import {styled} from "styled-components";

export const TableFrame = styled.div`
	--table-accent: #556bfc;
	--table-border: var(--card-border-color, #c8c9cd);
	--table-bg: var(--card-bg-color, #fff);
	--table-muted: var(--card-muted-bg-color, #f5f5f7);
	position: relative;
	margin: 12px 0;
	font: inherit;
	button { font: inherit; font-size: 13px; color: inherit; background: var(--table-bg); border: 1px solid var(--table-border); border-radius: 5px; padding: 6px 10px; cursor: pointer; touch-action: manipulation; }
	button:hover { background: var(--table-muted); }
	button:disabled { opacity: .45; cursor: default; }
	button:focus-visible { outline: 2px solid var(--table-accent); outline-offset: 2px; }
	button svg { width: 18px; height: 18px; display: block; }
	.scroll { overflow-x: auto; }
	.canvas { padding: 32px 28px; box-sizing: border-box; }
	.grid-surface { position: relative; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	td, th { position: relative; vertical-align: top; border: 1px solid var(--table-border); padding: 12px; text-align: left; font-weight: normal; }
	th { background: var(--table-muted); }
	th [data-ui="Text"] { font-weight: 600; }
	[data-cell-selected="true"] { background: color-mix(in srgb, var(--table-accent) 9%, var(--table-bg)); }
	.cell-select { position: absolute; z-index: 2; top: -8px; left: -8px; width: 24px; height: 24px; padding: 6px; border: 0; opacity: 0; background: transparent; }
	.cell-select svg { width: 12px; height: 12px; background: var(--table-bg); border-radius: 2px; }
	td:hover > .cell-select, th:hover > .cell-select, .cell-select:focus-visible, .cell-select[aria-pressed="true"] { opacity: 1; background: transparent; }
	.chrome { position: absolute; inset: 0; pointer-events: none; }
	.chrome button { pointer-events: auto; }
	.edge-button { position: absolute; display: grid; place-items: center; width: 24px; height: 24px; padding: 2px; border-color: transparent; background: transparent; color: #777b85; }
	.handle { cursor: grab; opacity: .35; touch-action: none; }
	[data-dragging="true"] { user-select: none; }
	.handle:hover, .handle:focus-visible, .handle[aria-expanded="true"] { opacity: 1; background: var(--table-muted); color: var(--table-accent); }
	.insert { opacity: 0; border-radius: 50%; }
	.insert:hover, .insert:focus-visible { opacity: 1; background: var(--table-accent); color: white; }
	.table-options { top: -28px; left: -28px; opacity: .5; }
	.table-options:hover, .table-options:focus-visible { opacity: 1; }
	.guide { position: absolute; background: var(--table-accent); pointer-events: none; z-index: 3; }
	.selection-outline { position: absolute; pointer-events: none; outline: 1px solid var(--table-accent); outline-offset: 0; z-index: 1; }
	.target { position: absolute; pointer-events: none; background: color-mix(in srgb, var(--table-accent) 7%, transparent); outline: 1px solid var(--table-accent); }
	.selection-tools { position: fixed; inset: auto; margin: 0; min-width: 0; color: inherit; gap: 3px; padding: 3px; border: 1px solid var(--table-border); border-radius: 7px; background: var(--table-bg); box-shadow: 0 3px 12px #0002; z-index: 5; }
	.selection-tools:popover-open { display: flex; }
	.selection-tools button { border: 0; white-space: nowrap; }
	.table-menu { position: fixed; inset: auto; margin: 0; padding: 5px; width: max-content; max-width: calc(100vw - 16px); box-sizing: border-box; max-height: min(480px, calc(100dvh - 16px)); overflow-y: auto; color: inherit; background: var(--table-bg); border: 1px solid var(--table-border); border-radius: 8px; box-shadow: 0 8px 32px #0003; }
	.table-menu:popover-open { display: flex; align-items: center; gap: 2px; }
	.table-menu button, .selection-tools button { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 30px; padding: 5px; border: 0; }
	.table-menu button[aria-checked="true"] { color: var(--table-accent); background: var(--table-muted); }
	.menu-action { display: contents; }
	.table-menu hr { width: 1px; height: 20px; border: 0; background: var(--table-border); margin: 0 4px; flex: 0 0 1px; }
	button.danger { color: #c33232; }
	.notice { margin: 4px 28px; font-size: 13px; }
	@media (hover: none) {
		.insert, .cell-select, .handle { opacity: .65; }
	}
`;
