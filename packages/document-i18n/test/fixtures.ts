import {createSchema, type ObjectSchemaType, type SanityDocument} from "sanity";
import {createReference} from "../src/utils/create-reference";

export const pageSchema = createSchema({
	name: "translation-tests",
	types: [
		{
			name: "page",
			type: "document",
			fields: [
				{name: "title", type: "string"},
				{name: "locale", type: "string"},
				{
					name: "secret",
					type: "string",
					options: {documentI18n: {exclude: true}},
				},
				{
					name: "enabled",
					type: "boolean",
					options: {documentI18n: {exclude: true}},
				},
				{
					name: "count",
					type: "number",
					options: {documentI18n: {exclude: true}},
				},
				{
					name: "settings",
					type: "object",
					fields: [
						{
							name: "secret",
							type: "string",
							options: {documentI18n: {exclude: true}},
						},
						{name: "visible", type: "string"},
					],
				},
				{
					name: "sections",
					type: "array",
					of: [
						{
							name: "section",
							type: "object",
							fields: [
								{
									name: "secret",
									type: "string",
									options: {documentI18n: {exclude: true}},
								},
								{name: "visible", type: "string"},
							],
						},
					],
				},
			],
		},
	],
}).get("page") as ObjectSchemaType;

export const source: SanityDocument = {
	_id: "page-en",
	_type: "page",
	_rev: "revision",
	_createdAt: "2025-01-01T00:00:00Z",
	_updatedAt: "2025-01-01T00:00:00Z",
	locale: "en",
	title: "Existing content",
	secret: "",
	enabled: false,
	count: 0,
	settings: {secret: "private", visible: "keep"},
	sections: [
		{_key: "section-one", _type: "section", secret: "private", visible: "keep"},
	],
};
export const metadata = {
	_id: "translation.metadata.existing",
	_rev: "metadata-revision",
	_type: "translation.metadata",
	_createdAt: source._createdAt,
	schemaTypes: ["page"],
	translations: [
		createReference("en", "page-en", "page"),
		createReference("de", "page-de", "page"),
	],
};
