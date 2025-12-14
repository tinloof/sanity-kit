import {cn} from "@/lib/utils";
import {BlogPtBlock} from "../rich-text";

export default function Table(data: BlogPtBlock<"table">) {
	if (!data?.rows?.length) {
		return null;
	}

	const [headerRow, ...bodyRows] = data.rows;

	return (
		<table className="my-8 w-full border-collapse border text-left">
			<thead>
				<tr>
					{headerRow.cells?.map((cell, index) => (
						<th
							className="min-w-0 border-r border-b p-6 last:border-r-0"
							key={index}
						>
							{cell || ""}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{bodyRows.map((row, rowIndex) => (
					<tr key={row?._key}>
						{row.cells?.map((cell, cellIndex) => (
							<td
								className={cn(
									"w-auto min-w-0 border-r p-6 wrap-break-word last:border-r-0",
									rowIndex < bodyRows.length - 1 ? "border-b" : "",
								)}
								key={cellIndex}
							>
								{cell || ""}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
