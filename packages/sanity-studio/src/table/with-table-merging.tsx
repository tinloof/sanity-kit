import type {PortableTextComponents} from "@portabletext/react";
import type {
	ArrayDefinition,
	ArrayOfObjectsComponents,
	FieldDefinition,
	PortableTextPluginsProps,
} from "sanity";
import {TablePlugin} from "./TablePlugin";

export type TableMergingOptions = {
	/** HTML clipboard renderers for the consumer's custom marks and objects. */
	clipboardComponents?: Partial<PortableTextComponents>;
};

/** Enables horizontal merging on one Portable Text field, preserving its other components and plugins. */
export function withTableMerging(
	field: FieldDefinition | ArrayDefinition,
	options: TableMergingOptions = {},
): ArrayDefinition {
	if (field.type !== "array") {
		throw new Error("Table merging requires a Portable Text array field.");
	}
	const array = field as ArrayDefinition;
	const components = array.components as ArrayOfObjectsComponents | undefined;
	const ExistingPlugins = components?.portableText?.plugins;
	function TableMergingPlugins(props: PortableTextPluginsProps) {
		const configured = {
			...props,
			plugins: {...props.plugins, table: {enabled: false}},
		};
		return (
			<>
				{ExistingPlugins ? (
					<ExistingPlugins {...configured} />
				) : (
					props.renderDefault(configured)
				)}
				<TablePlugin {...options} />
			</>
		);
	}
	return {
		...array,
		components: {
			...components,
			portableText: {
				...components?.portableText,
				plugins: TableMergingPlugins,
			},
		},
	};
}
