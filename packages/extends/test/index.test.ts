import type {DocumentDefinition, SchemaTypeDefinition} from "sanity";
import {describe, expect, it} from "vitest";
import type {AbstractDefinitionResolver, ExtendedType} from "../src";
import {defineAbstractResolver, withExtends} from "../src";

describe("schemaTypes", () => {
	describe("Basic functionality", () => {
		it("should return documents without extensions unchanged", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual(types[0]);
		});

		it("should preserve non-document and non-abstract types", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "object",
					name: "seo",
					title: "SEO",
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			expect(result).toHaveLength(2);
			expect(result.find((t) => t.name === "seo")).toBeDefined();
			expect(result.find((t) => t.name === "article")).toBeDefined();
		});

		it("should filter out abstract types from final output", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "baseAbstract",
					title: "Base Abstract",
					fields: [],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("article");
		});
	});

	describe("Single extension", () => {
		it("should merge document with single abstract extension", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.type).toBe("document");
			expect(article.fields).toHaveLength(2);
			expect(article.fields.map((f) => f.name)).toContain("baseField");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should merge document with document extension", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(2);
			expect(article.fields.map((f) => f.name)).toContain("baseField");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});
	});

	describe("Multiple extensions", () => {
		it("should merge document with multiple extensions (array)", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "seo",
					title: "SEO",
					fields: [{name: "metaTitle", type: "string"}],
				},
				{
					type: "abstract",
					name: "timestamps",
					title: "Timestamps",
					fields: [{name: "createdAt", type: "datetime"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["seo", "timestamps"],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("metaTitle");
			expect(article.fields.map((f) => f.name)).toContain("createdAt");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should handle extension chains (document extends document extends document)", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "id", type: "string"}],
				},
				{
					type: "document",
					name: "extended",
					title: "Extended",
					extends: "base",
					fields: [{name: "slug", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "extended",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("id");
			expect(article.fields.map((f) => f.name)).toContain("slug");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should handle deeply nested extension chains", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "levelOne",
					title: "Level One",
					fields: [{name: "field1", type: "string"}],
				},
				{
					type: "document",
					name: "levelTwo",
					title: "Level Two",
					extends: "levelOne",
					fields: [{name: "field2", type: "string"}],
				},
				{
					type: "document",
					name: "levelThree",
					title: "Level Three",
					extends: "levelTwo",
					fields: [{name: "field3", type: "string"}],
				},
				{
					type: "document",
					name: "levelFour",
					title: "Level Four",
					extends: "levelThree",
					fields: [{name: "field4", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "levelFour",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(5);
			expect(article.fields.map((f) => f.name)).toEqual([
				"field1",
				"field2",
				"field3",
				"field4",
				"title",
			]);
		});
	});

	describe("Circular dependency detection", () => {
		it("should throw error on direct self-extension", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "article",
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				"A document cannot extend itself",
			);
		});

		it("should throw error on two-step circular dependency", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "articleA",
					title: "Article A",
					extends: "articleB",
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "articleB",
					title: "Article B",
					extends: "articleA",
					fields: [{name: "content", type: "text"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				"Circular dependency detected",
			);
		});

		it("should throw error on three-step circular dependency", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "typeA",
					title: "Type A",
					extends: "typeB",
					fields: [{name: "fieldA", type: "string"}],
				},
				{
					type: "document",
					name: "typeB",
					title: "Type B",
					extends: "typeC",
					fields: [{name: "fieldB", type: "string"}],
				},
				{
					type: "document",
					name: "typeC",
					title: "Type C",
					extends: "typeA",
					fields: [{name: "fieldC", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				"Circular dependency detected",
			);
		});
	});

	describe("Field, options, and metadata merging", () => {
		it("should merge fields from multiple levels", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "articleField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields.map((f) => f.name)).toEqual([
				"baseField",
				"articleField",
			]);
		});

		it("should merge options objects deeply", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
					options: {collapsed: true},
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
					options: {modal: "dialog" as any},
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.options).toEqual({
				collapsed: true,
				modal: "dialog",
			});
		});

		it("should merge components objects", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
					components: {input: () => null} as any,
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
					components: {preview: () => null} as any,
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.components).toBeDefined();
			expect(article.components?.input).toBeDefined();
			expect(article.components?.preview).toBeDefined();
		});

		it("should merge initialValue objects", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
					initialValue: {status: "draft"},
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
					initialValue: {type: "article"},
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.initialValue).toEqual({
				status: "draft",
				type: "article",
			});
		});

		it("should merge orderings arrays", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
					orderings: [
						{
							title: "Newest",
							name: "newest",
							by: [{field: "_createdAt", direction: "desc"}],
						},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
					orderings: [
						{
							title: "A-Z",
							name: "alpha",
							by: [{field: "title", direction: "asc"}],
						},
					],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.orderings).toHaveLength(2);
		});

		it("should merge groups arrays", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
					groups: [{name: "content", title: "Content"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
					groups: [{name: "seo", title: "SEO"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.groups).toHaveLength(2);
		});

		it("should merge fieldsets arrays", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
					fieldsets: [{name: "timestamps", title: "Timestamps"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
					fieldsets: [{name: "publishing", title: "Publishing"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fieldsets).toHaveLength(2);
		});

		it("should remove extends property from merged document", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.extends).toBeUndefined();
		});

		it("should set type to document for merged types", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.type).toBe("document");
		});
	});

	describe("Edge cases", () => {
		it("should throw error when document extends non-existent type", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "nonExistent",
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				'Cannot extend non-existent type "nonExistent" in document "article"',
			);
		});

		it("should throw error when there are duplicate type names", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Another Article",
					fields: [{name: "content", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow('Duplicate type: "article"');
		});

		it("should handle empty fields arrays", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toEqual([]);
		});

		it("should handle undefined orderings, groups, and fieldsets", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.orderings).toBeUndefined();
			expect(article.groups).toBeUndefined();
			expect(article.fieldsets).toBeUndefined();
		});

		it("should handle mixed abstract and document extensions in chain", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "abstractBase",
					title: "Abstract Base",
					fields: [{name: "field1", type: "string"}],
				},
				{
					type: "document",
					name: "documentBase",
					title: "Document Base",
					extends: "abstractBase",
					fields: [{name: "field2", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "documentBase",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields.map((f) => f.name)).toEqual([
				"field1",
				"field2",
				"title",
			]);
		});

		it("should handle multiple documents extending the same base", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "articleField", type: "string"}],
				},
				{
					type: "document",
					name: "blog",
					title: "Blog",
					extends: "base",
					fields: [{name: "blogField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			const blog = result.find((t) => t.name === "blog") as DocumentDefinition;

			expect(article.fields.map((f) => f.name)).toEqual([
				"baseField",
				"articleField",
			]);
			expect(blog.fields.map((f) => f.name)).toEqual([
				"baseField",
				"blogField",
			]);
		});

		it("should preserve extension order when merging multiple extends", () => {
			const types = [
				{
					type: "abstract",
					name: "first",
					title: "First",
					fields: [{name: "firstField", type: "string"}],
				},
				{
					type: "abstract",
					name: "second",
					title: "Second",
					fields: [{name: "secondField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["first", "second"],
					fields: [{name: "articleField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			const fieldNames = article.fields.map((f) => f.name);
			expect(fieldNames).toContain("firstField");
			expect(fieldNames).toContain("secondField");
			expect(fieldNames).toContain("articleField");
			expect(fieldNames[fieldNames.length - 1]).toBe("articleField");
		});

		it("should handle complex multi-level, multi-branch inheritance", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "baseA",
					title: "Base A",
					fields: [{name: "fieldA", type: "string"}],
				},
				{
					type: "abstract",
					name: "baseB",
					title: "Base B",
					fields: [{name: "fieldB", type: "string"}],
				},
				{
					type: "document",
					name: "middle",
					title: "Middle",
					extends: ["baseA", "baseB"],
					fields: [{name: "fieldMiddle", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "middle",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			expect(article.fields.map((f) => f.name)).toContain("fieldA");
			expect(article.fields.map((f) => f.name)).toContain("fieldB");
			expect(article.fields.map((f) => f.name)).toContain("fieldMiddle");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should allow abstracts to extend other abstracts", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "baseAbstract",
					title: "Base Abstract",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "abstract",
					name: "extendedAbstract",
					title: "Extended Abstract",
					extends: "baseAbstract",
					fields: [{name: "extendedField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "extendedAbstract",
					fields: [{name: "articleField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);

			expect(result).toHaveLength(1);

			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			// Document should inherit from the entire chain
			expect(article.fields.map((f) => f.name)).toEqual([
				"baseField",
				"extendedField",
				"articleField",
			]);
		});

		it("should allow abstracts to extend documents", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "baseDocument",
					title: "Base Document",
					fields: [{name: "docField", type: "string"}],
				},
				{
					type: "abstract",
					name: "abstractFromDoc",
					title: "Abstract From Document",
					extends: "baseDocument",
					fields: [{name: "abstractField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "abstractFromDoc",
					fields: [{name: "articleField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);

			expect(result).toHaveLength(2);

			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			const baseDocument = result.find(
				(t) => t.name === "baseDocument",
			) as DocumentDefinition;

			// Article should inherit from the entire chain
			expect(article.fields.map((f) => f.name)).toEqual([
				"docField",
				"abstractField",
				"articleField",
			]);

			// Base document should remain unchanged
			expect(baseDocument.fields.map((f) => f.name)).toEqual(["docField"]);
		});
	});

	describe("Duplicate field name handling", () => {
		it("should override parent field when child has field with same name", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [
						{name: "title", type: "string", title: "Base Title"},
						{name: "description", type: "string"},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "title", type: "text", title: "Article Title"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			expect(article.fields).toHaveLength(2);
			// Child's title field should override parent's
			const titleField = article.fields.find((f) => f.name === "title");
			expect(titleField?.type).toBe("text");
			expect(titleField?.title).toBe("Article Title");
			// Parent's description field should be preserved
			expect(article.fields.map((f) => f.name)).toContain("description");
		});

		it("should preserve duplicate fields within the same child schema", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [
						{name: "title", type: "string", title: "First Title"},
						{name: "title", type: "text", title: "Second Title"},
					],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			// Should have baseField + both title fields from child
			expect(article.fields).toHaveLength(3);
			const titleFields = article.fields.filter((f) => f.name === "title");
			expect(titleFields).toHaveLength(2);
			expect(titleFields[0].title).toBe("First Title");
			expect(titleFields[1].title).toBe("Second Title");
		});

		it("should preserve duplicate fields within parent when child does not override", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [
						{name: "meta", type: "string", title: "First Meta"},
						{name: "meta", type: "text", title: "Second Meta"},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			// Should have both meta fields from parent + title from child
			expect(article.fields).toHaveLength(3);
			const metaFields = article.fields.filter((f) => f.name === "meta");
			expect(metaFields).toHaveLength(2);
			expect(metaFields[0].title).toBe("First Meta");
			expect(metaFields[1].title).toBe("Second Meta");
		});

		it("should replace all parent duplicates when child has field with same name", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [
						{name: "meta", type: "string", title: "Parent Meta 1"},
						{name: "meta", type: "text", title: "Parent Meta 2"},
						{name: "other", type: "string"},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "meta", type: "number", title: "Child Meta"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			// Should have other field from parent + meta from child (both parent metas removed)
			expect(article.fields).toHaveLength(2);
			const metaFields = article.fields.filter((f) => f.name === "meta");
			expect(metaFields).toHaveLength(1);
			expect(metaFields[0].type).toBe("number");
			expect(metaFields[0].title).toBe("Child Meta");
			// other field should still be there
			expect(article.fields.map((f) => f.name)).toContain("other");
		});

		it("should preserve child duplicates when overriding parent field", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [
						{name: "shared", type: "string", title: "Parent Shared"},
						{name: "other", type: "string"},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [
						{name: "shared", type: "text", title: "Child Shared 1"},
						{name: "shared", type: "number", title: "Child Shared 2"},
					],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			// Should have other from parent + both shared from child
			expect(article.fields).toHaveLength(3);
			const sharedFields = article.fields.filter((f) => f.name === "shared");
			expect(sharedFields).toHaveLength(2);
			expect(sharedFields[0].title).toBe("Child Shared 1");
			expect(sharedFields[1].title).toBe("Child Shared 2");
		});

		it("should handle duplicate field override in extension chains", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "grandparent",
					title: "Grandparent",
					fields: [{name: "field", type: "string", title: "Grandparent Field"}],
				},
				{
					type: "abstract",
					name: "parent",
					title: "Parent",
					extends: "grandparent",
					fields: [{name: "field", type: "text", title: "Parent Field"}],
				},
				{
					type: "document",
					name: "child",
					title: "Child",
					extends: "parent",
					fields: [{name: "field", type: "number", title: "Child Field"}],
				},
			];

			const result = withExtends(types)([]);
			const child = result.find(
				(t) => t.name === "child",
			) as DocumentDefinition;

			// Child's field should win
			expect(child.fields).toHaveLength(1);
			expect(child.fields[0].type).toBe("number");
			expect(child.fields[0].title).toBe("Child Field");
		});

		it("should handle multiple fields being overridden at once", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [
						{name: "fieldA", type: "string", title: "Base A"},
						{name: "fieldB", type: "string", title: "Base B"},
						{name: "fieldC", type: "string", title: "Base C"},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [
						{name: "fieldA", type: "text", title: "Override A"},
						{name: "fieldC", type: "number", title: "Override C"},
					],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			expect(article.fields).toHaveLength(3);

			const fieldA = article.fields.find((f) => f.name === "fieldA");
			expect(fieldA?.type).toBe("text");
			expect(fieldA?.title).toBe("Override A");

			const fieldB = article.fields.find((f) => f.name === "fieldB");
			expect(fieldB?.type).toBe("string");
			expect(fieldB?.title).toBe("Base B");

			const fieldC = article.fields.find((f) => f.name === "fieldC");
			expect(fieldC?.type).toBe("number");
			expect(fieldC?.title).toBe("Override C");
		});

		it("should handle complex scenario with duplicates in both parent and child", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [
						{name: "dup", type: "string", title: "Parent Dup 1"},
						{name: "dup", type: "text", title: "Parent Dup 2"},
						{name: "unique", type: "string", title: "Parent Unique"},
					],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [
						{name: "dup", type: "number", title: "Child Dup 1"},
						{name: "dup", type: "boolean", title: "Child Dup 2"},
						{name: "dup", type: "date", title: "Child Dup 3"},
					],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			// Should have unique from parent + all 3 dup from child
			expect(article.fields).toHaveLength(4);

			const dupFields = article.fields.filter((f) => f.name === "dup");
			expect(dupFields).toHaveLength(3);
			expect(dupFields.map((f) => f.type)).toEqual([
				"number",
				"boolean",
				"date",
			]);
			expect(dupFields.map((f) => f.title)).toEqual([
				"Child Dup 1",
				"Child Dup 2",
				"Child Dup 3",
			]);

			expect(article.fields.map((f) => f.name)).toContain("unique");
		});
	});

	describe("Abstract resolvers", () => {
		it("should resolve abstract resolver with document context", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => ({
					type: "abstract",
					name: "dynamicAbstract",
					fields: [{name: `${doc.name}Slug`, type: "slug"}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "dynamicAbstract",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(2);
			expect(article.fields.map((f) => f.name)).toContain("articleSlug");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should pass the correct document to the resolver", () => {
			let receivedDoc: DocumentDefinition | null = null;

			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => {
					receivedDoc = doc;
					return {
						type: "abstract" as const,
						name: "inspectorAbstract",
						fields: [{name: "inspected", type: "boolean"}],
					};
				}),
				{
					type: "document",
					name: "myDocument",
					title: "My Document",
					extends: "inspectorAbstract",
					fields: [{name: "content", type: "text"}],
				},
			];

			withExtends(types)([]);
			expect(receivedDoc).not.toBeNull();
			expect(receivedDoc!.name).toBe("myDocument");
			expect(receivedDoc!.title).toBe("My Document");
			expect(receivedDoc!.fields).toHaveLength(1);
			expect(receivedDoc!.fields[0].name).toBe("content");
		});

		it("should handle multiple documents extending the same resolver", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => ({
					type: "abstract" as const,
					name: "slugAbstract",
					fields: [{name: `${doc.name}Slug`, type: "slug"}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "slugAbstract",
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "page",
					title: "Page",
					extends: "slugAbstract",
					fields: [{name: "heading", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			const page = result.find((t) => t.name === "page") as DocumentDefinition;

			expect(article.fields.map((f) => f.name)).toContain("articleSlug");
			expect(page.fields.map((f) => f.name)).toContain("pageSlug");
		});

		it("should handle document extending both static abstract and resolver", () => {
			const types: ExtendedType[] = [
				{
					type: "abstract",
					name: "staticAbstract",
					fields: [{name: "staticField", type: "string"}],
				},
				defineAbstractResolver((doc) => ({
					type: "abstract" as const,
					name: "dynamicAbstract",
					fields: [{name: `${doc.name}Dynamic`, type: "string"}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["staticAbstract", "dynamicAbstract"],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("staticField");
			expect(article.fields.map((f) => f.name)).toContain("articleDynamic");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should resolve abstract resolver when extended through static abstract chain", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => ({
					type: "abstract" as const,
					name: "dynamicBase",
					fields: [{name: `${doc.name}BaseField`, type: "string"}],
				})),
				{
					type: "abstract",
					name: "middleAbstract",
					extends: "dynamicBase",
					fields: [{name: "middleField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "middleAbstract",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			// The resolver should receive the root document "article", not "middleAbstract"
			expect(article.fields.map((f) => f.name)).toContain("articleBaseField");
			expect(article.fields.map((f) => f.name)).toContain("middleField");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should resolve deeply nested chain with resolver at the bottom", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => ({
					type: "abstract" as const,
					name: "deepResolver",
					fields: [{name: `${doc.name}Deep`, type: "string"}],
				})),
				{
					type: "abstract",
					name: "level1",
					extends: "deepResolver",
					fields: [{name: "level1Field", type: "string"}],
				},
				{
					type: "abstract",
					name: "level2",
					extends: "level1",
					fields: [{name: "level2Field", type: "string"}],
				},
				{
					type: "document",
					name: "finalDoc",
					title: "Final Document",
					extends: "level2",
					fields: [{name: "docField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const finalDoc = result.find(
				(t) => t.name === "finalDoc",
			) as DocumentDefinition;
			expect(finalDoc.fields).toHaveLength(4);
			expect(finalDoc.fields.map((f) => f.name)).toContain("finalDocDeep");
			expect(finalDoc.fields.map((f) => f.name)).toContain("level1Field");
			expect(finalDoc.fields.map((f) => f.name)).toContain("level2Field");
			expect(finalDoc.fields.map((f) => f.name)).toContain("docField");
		});

		it("should allow resolver to access document fields", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => {
					const hasTitle = doc.fields?.some((f) => f.name === "title");
					return {
						type: "abstract" as const,
						name: "fieldInspector",
						fields: [
							{
								name: hasTitle ? "subtitle" : "title",
								type: "string",
							},
						],
					};
				}),
				{
					type: "document",
					name: "withTitle",
					title: "With Title",
					extends: "fieldInspector",
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "withoutTitle",
					title: "Without Title",
					extends: "fieldInspector",
					fields: [{name: "body", type: "text"}],
				},
			];

			const result = withExtends(types)([]);
			const withTitle = result.find(
				(t) => t.name === "withTitle",
			) as DocumentDefinition;
			const withoutTitle = result.find(
				(t) => t.name === "withoutTitle",
			) as DocumentDefinition;

			// Document with title should get subtitle from resolver
			expect(withTitle.fields.map((f) => f.name)).toContain("subtitle");
			expect(withTitle.fields.map((f) => f.name)).toContain("title");

			// Document without title should get title from resolver
			expect(withoutTitle.fields.map((f) => f.name)).toContain("title");
			expect(withoutTitle.fields.map((f) => f.name)).toContain("body");
		});

		it("should allow resolver to return additional properties like fieldsets and groups", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => ({
					type: "abstract" as const,
					name: "richAbstract",
					fields: [{name: `${doc.name}Field`, type: "string", fieldset: "seo"}],
					fieldsets: [{name: "seo", title: `${doc.name} SEO`}],
					groups: [{name: "metadata", title: `${doc.name} Metadata`}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "richAbstract",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;

			expect(article.fields.map((f) => f.name)).toContain("articleField");
			expect(article.fieldsets).toBeDefined();
			expect(article.fieldsets).toHaveLength(1);
			expect(article.fieldsets![0].title).toBe("article SEO");
			expect(article.groups).toBeDefined();
			expect(article.groups).toHaveLength(1);
			expect(article.groups![0].title).toBe("article Metadata");
		});

		it("should filter out abstract resolvers from final output", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "hiddenResolver",
					fields: [{name: "hidden", type: "string"}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "hiddenResolver",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("article");
		});

		it("should throw error when extending non-existent resolver", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "nonExistentResolver",
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				'Cannot extend non-existent type "nonExistentResolver"',
			);
		});

		it("should pass options to resolver when extending with options object", () => {
			let receivedOptions: object | boolean | undefined;

			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					receivedOptions = options;
					return {
						type: "abstract" as const,
						name: "sluggable",
						fields: [{name: "slug", type: "slug"}],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {
						type: "sluggable",
						parameters: {source: "title", maxLength: 96},
					},
					fields: [{name: "title", type: "string"}],
				},
			];

			withExtends(types)([]);
			expect(receivedOptions).toEqual({source: "title", maxLength: 96});
		});

		it("should pass true to resolver when extending with boolean", () => {
			let receivedOptions: object | boolean | undefined;

			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					receivedOptions = options;
					return {
						type: "abstract" as const,
						name: "timestampable",
						fields: [{name: "createdAt", type: "datetime"}],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "timestampable",
					fields: [{name: "title", type: "string"}],
				},
			];

			withExtends(types)([]);
			expect(receivedOptions).toBe(true);
		});

		it("should allow resolver to use options to customize fields", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					const opts = options as {source?: string} | undefined;
					return {
						type: "abstract" as const,
						name: "sluggable",
						fields: [
							{
								name: "slug",
								type: "slug",
								options: {source: opts?.source ?? "title"},
							},
						],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {type: "sluggable", parameters: {source: "name"}},
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			const slugField = article.fields.find((f) => f.name === "slug");
			expect(slugField?.options).toEqual({source: "name"});
		});

		it("should pass different options to same resolver for different documents", () => {
			const receivedOptionsMap: Record<string, object | boolean | undefined> =
				{};

			const types: ExtendedType[] = [
				defineAbstractResolver((doc, options) => {
					receivedOptionsMap[doc.name] = options;
					return {
						type: "abstract" as const,
						name: "sluggable",
						fields: [{name: "slug", type: "slug"}],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {type: "sluggable", parameters: {source: "title"}},
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "page",
					title: "Page",
					extends: {
						type: "sluggable",
						parameters: {source: "heading", maxLength: 50},
					},
					fields: [{name: "heading", type: "string"}],
				},
			];

			withExtends(types)([]);
			expect(receivedOptionsMap["article"]).toEqual({source: "title"});
			expect(receivedOptionsMap["page"]).toEqual({
				source: "heading",
				maxLength: 50,
			});
		});
	});

	describe("String and array extends formats", () => {
		it("should handle extends as a single string", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "base",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.type).toBe("document");
			expect(article.fields).toHaveLength(2);
			expect(article.fields.map((f) => f.name)).toContain("baseField");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should handle extends as an array of strings", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "seo",
					title: "SEO",
					fields: [{name: "metaTitle", type: "string"}],
				},
				{
					type: "abstract",
					name: "timestamps",
					title: "Timestamps",
					fields: [{name: "createdAt", type: "datetime"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["seo", "timestamps"],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.type).toBe("document");
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("metaTitle");
			expect(article.fields.map((f) => f.name)).toContain("createdAt");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should handle extends as an empty array", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: [],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.type).toBe("document");
			expect(article.fields).toHaveLength(1);
			expect(article.fields[0].name).toBe("title");
		});

		it("should handle string extends with resolver", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((doc) => ({
					type: "abstract",
					name: "sluggable",
					fields: [
						{
							name: "slug",
							type: "slug",
							options: {source: doc.name},
						},
					],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "sluggable",
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(2);
			expect(article.fields.map((f) => f.name)).toContain("slug");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should handle array extends with resolvers", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver(() => ({
					type: "abstract",
					name: "sluggable",
					fields: [{name: "slug", type: "slug"}],
				})),
				defineAbstractResolver(() => ({
					type: "abstract",
					name: "publishable",
					fields: [{name: "publishedAt", type: "datetime"}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["sluggable", "publishable"],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("slug");
			expect(article.fields.map((f) => f.name)).toContain("publishedAt");
			expect(article.fields.map((f) => f.name)).toContain("title");
		});

		it("should handle string extends in parent chain", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "grandparent",
					title: "Grandparent",
					fields: [{name: "grandparentField", type: "string"}],
				},
				{
					type: "abstract",
					name: "parent",
					title: "Parent",
					extends: "grandparent",
					fields: [{name: "parentField", type: "string"}],
				},
				{
					type: "document",
					name: "child",
					title: "Child",
					extends: "parent",
					fields: [{name: "childField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const child = result.find(
				(t) => t.name === "child",
			) as DocumentDefinition;
			expect(child.fields).toHaveLength(3);
			expect(child.fields.map((f) => f.name)).toContain("grandparentField");
			expect(child.fields.map((f) => f.name)).toContain("parentField");
			expect(child.fields.map((f) => f.name)).toContain("childField");
		});

		it("should handle array extends in parent chain", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base1",
					title: "Base 1",
					fields: [{name: "field1", type: "string"}],
				},
				{
					type: "abstract",
					name: "base2",
					title: "Base 2",
					fields: [{name: "field2", type: "string"}],
				},
				{
					type: "abstract",
					name: "parent",
					title: "Parent",
					extends: ["base1", "base2"],
					fields: [{name: "parentField", type: "string"}],
				},
				{
					type: "document",
					name: "child",
					title: "Child",
					extends: "parent",
					fields: [{name: "childField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const child = result.find(
				(t) => t.name === "child",
			) as DocumentDefinition;
			expect(child.fields).toHaveLength(4);
			expect(child.fields.map((f) => f.name)).toContain("field1");
			expect(child.fields.map((f) => f.name)).toContain("field2");
			expect(child.fields.map((f) => f.name)).toContain("parentField");
			expect(child.fields.map((f) => f.name)).toContain("childField");
		});

		it("should throw error when string extends references non-existent type", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "nonExistent",
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				'Cannot extend non-existent type "nonExistent"',
			);
		});

		it("should throw error when array extends references non-existent type", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["base", "nonExistent"],
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				'Cannot extend non-existent type "nonExistent"',
			);
		});

		it("should detect circular dependency with string extends", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: "article",
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow("cannot extend itself");
		});

		it("should detect circular dependency with array extends", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "abstract",
					name: "base",
					title: "Base",
					extends: ["article"],
					fields: [{name: "baseField", type: "string"}],
				},
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: ["base"],
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				"Circular dependency detected",
			);
		});

		it("should mix string, array, and ExtendsOptionsArrayEntry formats", () => {
			let receivedOptions: object | boolean | undefined;
			const types: ExtendedType[] = [
				{
					type: "abstract",
					name: "base1",
					title: "Base 1",
					fields: [{name: "field1", type: "string"}],
				},
				{
					type: "abstract",
					name: "base2",
					title: "Base 2",
					fields: [{name: "field2", type: "string"}],
				},
				defineAbstractResolver((_doc, options) => {
					receivedOptions = options;
					return {
						type: "abstract",
						name: "configurable",
						fields: [{name: "field3", type: "string"}],
					};
				}),
				{
					type: "document",
					name: "docWithString",
					title: "Doc With String",
					extends: "base1",
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "docWithArray",
					title: "Doc With Array",
					extends: ["base1", "base2"],
					fields: [{name: "title", type: "string"}],
				},
				{
					type: "document",
					name: "docWithObject",
					title: "Doc With Object",
					extends: {type: "configurable", parameters: {custom: "option"}},
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);

			const docWithString = result.find(
				(t) => t.name === "docWithString",
			) as DocumentDefinition;
			expect(docWithString.fields).toHaveLength(2);
			expect(docWithString.fields.map((f) => f.name)).toContain("field1");

			const docWithArray = result.find(
				(t) => t.name === "docWithArray",
			) as DocumentDefinition;
			expect(docWithArray.fields).toHaveLength(3);
			expect(docWithArray.fields.map((f) => f.name)).toContain("field1");
			expect(docWithArray.fields.map((f) => f.name)).toContain("field2");

			const docWithObject = result.find(
				(t) => t.name === "docWithObject",
			) as DocumentDefinition;
			expect(docWithObject.fields).toHaveLength(2);
			expect(docWithObject.fields.map((f) => f.name)).toContain("field3");
			expect(receivedOptions).toEqual({custom: "option"});
		});
	});

	describe("ExtendsOptionsArrayEntry and ExtendsOptionsArray formats", () => {
		it("should handle extends as a single ExtendsOptionsArrayEntry", () => {
			let receivedOptions: object | boolean | undefined;
			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					receivedOptions = options;
					return {
						type: "abstract",
						name: "sluggable",
						fields: [{name: "slug", type: "slug"}],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {type: "sluggable", parameters: {source: "title"}},
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(2);
			expect(article.fields.map((f) => f.name)).toContain("slug");
			expect(article.fields.map((f) => f.name)).toContain("title");
			expect(receivedOptions).toEqual({source: "title"});
		});

		it("should handle extends as an ExtendsOptionsArray", () => {
			const receivedOptionsMap: Record<string, object | boolean | undefined> =
				{};
			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					if (options && typeof options === "object" && "source" in options) {
						receivedOptionsMap["sluggable"] = options;
					}
					return {
						type: "abstract",
						name: "sluggable",
						fields: [{name: "slug", type: "slug"}],
					};
				}),
				defineAbstractResolver((_doc, options) => {
					if (
						options &&
						typeof options === "object" &&
						"defaultTitle" in options
					) {
						receivedOptionsMap["seo"] = options;
					}
					return {
						type: "abstract",
						name: "seo",
						fields: [{name: "metaTitle", type: "string"}],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: [
						{type: "sluggable", parameters: {source: "title"}},
						{type: "seo", parameters: {defaultTitle: "My Site"}},
					],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("slug");
			expect(article.fields.map((f) => f.name)).toContain("metaTitle");
			expect(article.fields.map((f) => f.name)).toContain("title");
			expect(receivedOptionsMap["sluggable"]).toEqual({source: "title"});
			expect(receivedOptionsMap["seo"]).toEqual({defaultTitle: "My Site"});
		});

		it("should handle mixed array with strings and ExtendsOptionsArrayEntry", () => {
			let receivedOptions: object | boolean | undefined;
			const types: ExtendedType[] = [
				{
					type: "abstract",
					name: "timestamps",
					title: "Timestamps",
					fields: [{name: "createdAt", type: "datetime"}],
				},
				defineAbstractResolver((_doc, options) => {
					receivedOptions = options;
					return {
						type: "abstract",
						name: "sluggable",
						fields: [{name: "slug", type: "slug"}],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: [
						"timestamps",
						{type: "sluggable", parameters: {source: "title"}},
					],
					fields: [{name: "title", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			expect(article.fields).toHaveLength(3);
			expect(article.fields.map((f) => f.name)).toContain("createdAt");
			expect(article.fields.map((f) => f.name)).toContain("slug");
			expect(article.fields.map((f) => f.name)).toContain("title");
			expect(receivedOptions).toEqual({source: "title"});
		});

		it("should handle ExtendsOptionsArrayEntry in parent chain", () => {
			let receivedOptions: object | boolean | undefined;
			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					receivedOptions = options;
					return {
						type: "abstract",
						name: "base",
						fields: [{name: "baseField", type: "string"}],
					};
				}),
				{
					type: "abstract",
					name: "parent",
					title: "Parent",
					extends: {type: "base", parameters: {customOption: true}},
					fields: [{name: "parentField", type: "string"}],
				},
				{
					type: "document",
					name: "child",
					title: "Child",
					extends: "parent",
					fields: [{name: "childField", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const child = result.find(
				(t) => t.name === "child",
			) as DocumentDefinition;
			expect(child.fields).toHaveLength(3);
			expect(child.fields.map((f) => f.name)).toContain("baseField");
			expect(child.fields.map((f) => f.name)).toContain("parentField");
			expect(child.fields.map((f) => f.name)).toContain("childField");
			expect(receivedOptions).toEqual({customOption: true});
		});

		it("should throw error when ExtendsOptionsArrayEntry references non-existent type", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {type: "nonExistent", parameters: {foo: "bar"}},
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				'Cannot extend non-existent type "nonExistent"',
			);
		});

		it("should throw error when ExtendsOptionsArray references non-existent type", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver(() => ({
					type: "abstract",
					name: "existing",
					fields: [{name: "field", type: "string"}],
				})),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: [
						{type: "existing", parameters: {}},
						{type: "nonExistent", parameters: {foo: "bar"}},
					],
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow(
				'Cannot extend non-existent type "nonExistent"',
			);
		});

		it("should allow resolver to use parameters from ExtendsOptionsArrayEntry", () => {
			const types: ExtendedType[] = [
				defineAbstractResolver((_doc, options) => {
					const opts = options as {source: string; maxLength?: number};
					return {
						type: "abstract",
						name: "sluggable",
						fields: [
							{
								name: "slug",
								type: "slug",
								options: {
									source: opts?.source || "title",
									maxLength: opts?.maxLength || 96,
								},
							},
						],
					};
				}),
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {
						type: "sluggable",
						parameters: {source: "headline", maxLength: 50},
					},
					fields: [{name: "headline", type: "string"}],
				},
			];

			const result = withExtends(types)([]);
			const article = result.find(
				(t) => t.name === "article",
			) as DocumentDefinition;
			const slugField = article.fields.find((f) => f.name === "slug") as any;
			expect(slugField.options.source).toBe("headline");
			expect(slugField.options.maxLength).toBe(50);
		});

		it("should detect circular dependency with ExtendsOptionsArrayEntry", () => {
			const types: SchemaTypeDefinition[] = [
				{
					type: "document",
					name: "article",
					title: "Article",
					extends: {type: "article", parameters: {}},
					fields: [{name: "title", type: "string"}],
				},
			];

			expect(() => withExtends(types)([])).toThrow("cannot extend itself");
		});
	});
});
