import {createSchema} from "sanity";
import {describe, expect, it} from "vitest";
import {DuplicateWithTranslationsAction} from "../src/actions/duplicate-with-transaltion-action";
import {documentI18n} from "../src/plugin";
import metadataSchema from "../src/schema/translation/metadata";
import {createReference} from "../src/utils/create-reference";
import {removeExcludedPaths} from "../src/utils/exclude-paths";
import {metadata, pageSchema, source} from "./fixtures";

describe("existing translation data", () => {
	it("uses the locale as the reference key without adding a language field", () => {
		expect(createReference("pt-BR", "page-pt", "page")).toEqual({
			_key: "pt-BR",
			_type: "internationalizedArrayReferenceValue",
			value: {
				_type: "reference",
				_ref: "page-pt",
				_weak: true,
				_strengthenOnPublish: {type: "page"},
			},
		});
	});
	it("keeps explicitly weak references weak", () => {
		expect(createReference("en", "page-en", "page", false).value).toEqual({
			_type: "reference",
			_ref: "page-en",
			_weak: true,
		});
	});
	it("previews existing metadata using locale keys", () => {
		expect(
			metadataSchema(["page"], []).preview?.prepare?.({
				translations: metadata.translations,
				documentSchemaTypes: ["page"],
			}),
		).toEqual({title: "2 Translations", subtitle: "(EN, DE) page"});
	});
	it("excludes nested fields while preserving content and array keys", () => {
		const result = removeExcludedPaths(source, pageSchema);
		expect(result?.settings).toEqual({visible: "keep"});
		expect(result?.sections).toEqual([
			{_key: "section-one", _type: "section", visible: "keep"},
		]);
		expect(result?.title).toBe(source.title);
		expect(source.settings).toEqual({secret: "private", visible: "keep"});
	});
	it.each([false, 0, "", null])(
		"excludes a field whose value is %j",
		(value) => {
			const input = {...source, secret: value};
			expect(removeExcludedPaths(input, pageSchema)).not.toHaveProperty(
				"secret",
			);
			expect(input).toHaveProperty("secret", value);
		},
	);
	it("accepts missing documents and absent optional fields", () => {
		expect(removeExcludedPaths(null, pageSchema)).toBeNull();
		const {_id, _type, _rev, _createdAt, _updatedAt} = source;
		const minimal = {_id, _type, _rev, _createdAt, _updatedAt};
		expect(removeExcludedPaths(minimal, pageSchema)).toEqual(minimal);
	});
});

describe("standard plugin action integration", () => {
	const schema = createSchema({
		name: "actions",
		types: [
			{
				name: "page",
				type: "document",
				fields: [{name: "locale", type: "string"}],
			},
			{
				name: "ordinary",
				type: "document",
				fields: [{name: "title", type: "string"}],
			},
		],
	});
	const duplicate = Object.assign(() => ({label: "Duplicate"}), {
		action: "duplicate" as const,
	});
	const remove = Object.assign(() => ({label: "Delete"}), {
		action: "delete" as const,
	});
	const actions = documentI18n({locales: [{id: "en", title: "English"}]})
		.document!.actions as any;
	const context = {schema, schemaType: "page", versionType: "published"};
	it("adds group duplication and replaces deletion only for localized schemas", () => {
		const result = actions([duplicate, remove], context);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe(duplicate);
		expect(result[1]).not.toBe(DuplicateWithTranslationsAction);
		expect(result[1].action).toBe("duplicate");
		expect(result[2]).not.toBe(remove);
		expect(result[2].action).toBe("delete");
		expect(
			actions([duplicate, remove], {...context, schemaType: "ordinary"}),
		).toEqual([duplicate, remove]);
	});
	it("preserves removed actions and does not install group duplication twice", () => {
		expect(actions([], context)).toEqual([]);
		expect(
			actions([duplicate, DuplicateWithTranslationsAction], context),
		).toEqual([duplicate, DuplicateWithTranslationsAction]);
	});
	it.each(["version", "scheduled-draft", "revision"])(
		"leaves %s actions with Sanity",
		(versionType) => {
			expect(actions([duplicate, remove], {...context, versionType})).toEqual([
				duplicate,
				remove,
			]);
		},
	);
});
