import {Text} from "@sanity/ui";
import {Preview, useSchema} from "sanity";
import {Feedback} from "sanity-plugin-utils";
import {METADATA_SCHEMA_NAME} from "../../constants";

type DocumentPreviewProps = {
	value: unknown;
	type: string;
};

// Wrapper of Preview just so that the schema type is satisfied by schema.get()
export default function DocumentPreview(props: DocumentPreviewProps) {
	const schema = useSchema();

	const schemaType = schema.get(props.type);
	if (!schemaType) {
		if (props.type === METADATA_SCHEMA_NAME) {
			const value = props.value as {translations?: {_key: string}[]};
			const locales = value.translations
				?.map((item) => item._key.toUpperCase())
				.join(", ");
			return <Text>Translations{locales ? ` (${locales})` : ""}</Text>;
		}
		return <Feedback tone="critical" title="Schema type not found" />;
	}

	return <Preview value={props.value} schemaType={schemaType} />;
}
