import {
	type ArrayDefinition,
	defineArrayMember,
	defineField,
	defineType,
	type FieldDefinition,
	type ObjectDefinition,
} from "sanity";
import {gridError} from "./grid";

/** Defines the fixed table/rows/cells/value schema using your cell Portable Text field. */
export function defineTableSchema(
	cellContent: FieldDefinition | ArrayDefinition,
): ObjectDefinition {
	if (cellContent.type !== "array")
		throw new Error("Table cell content must be a Portable Text array field.");
	return defineType({
		name: "table",
		title: "Table",
		type: "object",
		validation: (Rule) =>
			Rule.custom((value) => (value ? (gridError(value) ?? true) : true)),
		fields: [
			defineField({
				name: "headerRows",
				title: "Header rows",
				type: "number",
				initialValue: 0,
				validation: (Rule) => Rule.integer().min(0).max(1),
			}),
			defineField({
				name: "rows",
				type: "array",
				validation: (Rule) => Rule.required().min(1),
				of: [
					defineArrayMember({
						name: "row",
						type: "object",
						fields: [
							defineField({
								name: "cells",
								type: "array",
								validation: (Rule) => Rule.required().min(1),
								of: [
									defineArrayMember({
										name: "cell",
										type: "object",
										fields: [
											defineField({
												name: "colSpan",
												title: "Column span",
												type: "number",
												hidden: true,
												validation: (Rule) => Rule.integer().min(1),
											}),
											defineField({
												...(cellContent as ArrayDefinition),
												name: "value",
												title: "Value",
											}),
										],
									}),
								],
							}),
						],
					}),
				],
			}),
		],
		preview: {
			select: {rows: "rows"},
			prepare({rows = []}: {rows?: {cells?: {colSpan?: number}[]}[]}) {
				const rowCount = rows.length;
				const columnCount = Math.max(
					0,
					...rows.map(
						(row) =>
							row.cells?.reduce(
								(width, cell) => width + (cell.colSpan ?? 1),
								0,
							) ?? 0,
					),
				);
				return {
					title: "Table",
					subtitle: `${rowCount} ${rowCount === 1 ? "row" : "rows"} × ${columnCount} ${columnCount === 1 ? "column" : "columns"}`,
				};
			},
		},
	});
}
