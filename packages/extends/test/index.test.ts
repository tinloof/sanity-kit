import {describe, it, expect} from "vitest";
import {withExtends} from "../";
import type {DocumentDefinition, SchemaTypeDefinition} from "sanity";

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
});
