import {PortableText, type PortableTextComponents} from "@portabletext/react";
import {renderToStaticMarkup} from "react-dom/server";
import type {Table} from "./grid";

export function clipboardTableHtml(
	table: Table,
	components?: Partial<PortableTextComponents>,
): string {
	return renderToStaticMarkup(
		<table>
			<tbody>
				{table.rows.map((row, index) => {
					const Cell = index < (table.headerRows ?? 0) ? "th" : "td";
					return (
						<tr key={row._key}>
							{row.cells.map((cell) => (
								<Cell
									key={cell._key}
									colSpan={cell.colSpan ?? 1}
									scope={Cell === "th" ? "col" : undefined}
								>
									<PortableText value={cell.value} components={components} />
								</Cell>
							))}
						</tr>
					);
				})}
			</tbody>
		</table>,
	);
}
