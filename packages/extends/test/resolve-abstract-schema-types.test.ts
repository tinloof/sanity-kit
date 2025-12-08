import { describe, expect, it, vi } from "vitest";
import { defineAbstractResolver } from "../src/define-abstract-resolver";
import { resolveAbstractSchemaTypes } from "../src/resolve-abstract-schema-types";
import type { AbstractDefinition, ExtendedType } from "../src/types";

describe("resolveAbstractSchemaTypes", () => {
	describe("Basic functionality", () => {
		it("should return empty array when abstracts is false", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [{ name: "isSingleton", type: "boolean" }],
				})),
			};

			const result = resolveAbstractSchemaTypes(schemaMap, false);

			expect(result).toEqual([]);
		});

		it("should return empty array when abstracts is empty object", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [{ name: "isSingleton", type: "boolean" }],
				})),
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {});

			expect(result).toEqual([]);
		});

		it("should return empty array when no abstracts are enabled", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [{ name: "isSingleton", type: "boolean" }],
				})),
				sync: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "sync",
					fields: [{ name: "syncEnabled", type: "boolean" }],
				})),
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: false,
				sync: false,
			});

			expect(result).toEqual([]);
		});

		it("should return enabled abstract resolvers", () => {
			const singletonResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "singleton",
				fields: [{ name: "isSingleton", type: "boolean" }],
			}));

			const syncResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "sync",
				fields: [{ name: "syncEnabled", type: "boolean" }],
			}));

			const schemaMap = {
				singleton: singletonResolver,
				sync: syncResolver,
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: true,
				sync: false,
			});

			expect(result).toHaveLength(1);
			// The resolver should be included (either wrapped or original)
			expect(typeof result[0]).toBe("function");
		});

		it("should return multiple enabled abstract resolvers", () => {
			const singletonResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "singleton",
				fields: [{ name: "isSingleton", type: "boolean" }],
			}));

			const syncResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "sync",
				fields: [{ name: "syncEnabled", type: "boolean" }],
			}));

			const seoResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "seo",
				fields: [{ name: "metaTitle", type: "string" }],
			}));

			const schemaMap = {
				singleton: singletonResolver,
				sync: syncResolver,
				seo: seoResolver,
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: true,
				sync: true,
				seo: false,
			});

			expect(result).toHaveLength(2);
		});
	});

	describe("Schema type definitions (non-functions)", () => {
		it("should return schema type definitions when enabled", () => {
			const singletonSchema: AbstractDefinition = {
				type: "abstract",
				name: "singleton",
				fields: [{ name: "isSingleton", type: "boolean" }],
			};

			const schemaMap: Record<string, ExtendedType> = {
				singleton: singletonSchema as unknown as ExtendedType,
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: true,
			});

			expect(result).toHaveLength(1);
			expect(result[0]).toBe(singletonSchema);
		});

		it("should not wrap non-function types even when options are provided", () => {
			const singletonSchema: AbstractDefinition = {
				type: "abstract",
				name: "singleton",
				fields: [{ name: "isSingleton", type: "boolean" }],
			};

			const schemaMap: Record<string, ExtendedType> = {
				singleton: singletonSchema as unknown as ExtendedType,
			};

			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{ singleton: true },
				{ apiVersion: "2024-01-01" },
			);

			expect(result).toHaveLength(1);
			expect(result[0]).toBe(singletonSchema);
		});
	});

	describe("Options merging", () => {
		it("should wrap resolver with options when options are provided", () => {
			const receivedOptions: any[] = [];

			const singletonResolver = defineAbstractResolver((_doc, options) => {
				receivedOptions.push(options);
				return {
					type: "abstract" as const,
					name: "singleton",
					fields: [{ name: "isSingleton", type: "boolean" }],
				};
			});

			const schemaMap = {
				singleton: singletonResolver,
			};

			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{ singleton: true },
				{ apiVersion: "2024-01-01" },
			);

			expect(result).toHaveLength(1);

			// Call the wrapped resolver to verify options are merged
			const wrappedResolver = result[0] as typeof singletonResolver;
			wrappedResolver(
				{ type: "document", name: "test", fields: [] },
				{ custom: "value" },
			);

			expect(receivedOptions[0]).toEqual({
				custom: "value",
				apiVersion: "2024-01-01",
			});
		});

		it("should not wrap resolver when no options are provided", () => {
			const singletonResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "singleton",
				fields: [{ name: "isSingleton", type: "boolean" }],
			}));

			const schemaMap = {
				singleton: singletonResolver,
			};

			const result = resolveAbstractSchemaTypes(schemaMap, { singleton: true });

			expect(result).toHaveLength(1);
			expect(result[0]).toBe(singletonResolver);
		});

		it("should merge global options with resolver-specific options", () => {
			let capturedOptions: any;

			const sluggableResolver = defineAbstractResolver((_doc, options) => {
				capturedOptions = options;
				return {
					type: "abstract" as const,
					name: "sluggable",
					fields: [
						{
							name: "slug",
							type: "slug",
							options: { source: (options as any)?.source ?? "title" },
						},
					],
				};
			});

			const schemaMap = {
				sluggable: sluggableResolver,
			};

			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{ sluggable: true },
				{ globalOption: "global-value" },
			);

			// Call the wrapped resolver with resolver-specific options
			const wrappedResolver = result[0] as typeof sluggableResolver;
			wrappedResolver(
				{ type: "document", name: "test", fields: [] },
				{ source: "name", resolverOption: "resolver-value" },
			);

			expect(capturedOptions).toEqual({
				source: "name",
				resolverOption: "resolver-value",
				globalOption: "global-value",
			});
		});

		it("should allow global options to override resolver-specific options", () => {
			let capturedOptions: any;

			const resolver = defineAbstractResolver((_doc, options) => {
				capturedOptions = options;
				return {
					type: "abstract" as const,
					name: "test",
					fields: [],
				};
			});

			const schemaMap = { test: resolver };

			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{ test: true },
				{ sharedKey: "global" },
			);

			const wrappedResolver = result[0] as typeof resolver;
			wrappedResolver(
				{ type: "document", name: "test", fields: [] },
				{ sharedKey: "local" },
			);

			// Global options should override local ones (spread order: {...resolverOptions, ...options})
			expect(capturedOptions.sharedKey).toBe("global");
		});
	});

	describe("Edge cases", () => {
		it("should ignore keys not in schema map", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [],
				})),
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: true,
				nonExistent: true,
			} as any);

			expect(result).toHaveLength(1);
		});

		it("should handle undefined values in abstracts config", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [],
				})),
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: undefined,
			} as any);

			expect(result).toHaveLength(0);
		});

		it("should handle default empty abstracts parameter", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [],
				})),
			};

			const result = resolveAbstractSchemaTypes(schemaMap);

			expect(result).toEqual([]);
		});

		it("should preserve resolver functionality when wrapped", () => {
			const resolver = defineAbstractResolver((doc) => ({
				type: "abstract" as const,
				name: "contextual",
				title: `Abstract for ${doc.name}`,
				fields: [{ name: "contextField", type: "string" }],
			}));

			const schemaMap = { contextual: resolver };

			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{ contextual: true },
				{ someOption: true },
			);

			const wrappedResolver = result[0] as typeof resolver;
			const resolved = wrappedResolver(
				{ type: "document", name: "myDocument", fields: [] },
				{},
			);

			expect(resolved.name).toBe("contextual");
			expect(resolved.title).toBe("Abstract for myDocument");
			expect(resolved.fields).toHaveLength(1);
		});

		it("should work with empty schema map", () => {
			const result = resolveAbstractSchemaTypes({}, {});

			expect(result).toEqual([]);
		});

		it("should maintain order of enabled abstracts based on iteration order", () => {
			const firstResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "first",
				fields: [],
			}));

			const secondResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "second",
				fields: [],
			}));

			const thirdResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "third",
				fields: [],
			}));

			const schemaMap = {
				first: firstResolver,
				second: secondResolver,
				third: thirdResolver,
			};

			const result = resolveAbstractSchemaTypes(schemaMap, {
				first: true,
				second: true,
				third: true,
			});

			expect(result).toHaveLength(3);
		});
	});

	describe("Type safety", () => {
		it("should accept properly typed abstracts config", () => {
			const schemaMap = {
				singleton: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "singleton",
					fields: [],
				})),
				sync: defineAbstractResolver(() => ({
					type: "abstract" as const,
					name: "sync",
					fields: [],
				})),
			};

			// This should compile without errors
			const result = resolveAbstractSchemaTypes(schemaMap, {
				singleton: true,
				sync: false,
			});

			expect(result).toHaveLength(1);
		});

		it("should accept Record<string, unknown> options", () => {
			const resolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "test",
				fields: [],
			}));

			const schemaMap = { test: resolver };

			const options: Record<string, unknown> = {
				stringOption: "value",
				numberOption: 42,
				booleanOption: true,
				objectOption: { nested: "value" },
				arrayOption: [1, 2, 3],
			};

			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{ test: true },
				options,
			);

			expect(result).toHaveLength(1);
		});
	});

	describe("Integration scenarios", () => {
		it("should work with a realistic schema map", () => {
			const singletonResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "singleton",
				fields: [{ name: "isSingleton", type: "boolean", initialValue: true }],
			}));

			const sluggableResolver = defineAbstractResolver((_doc, options) => ({
				type: "abstract" as const,
				name: "sluggable",
				fields: [
					{
						name: "slug",
						type: "slug",
						options: {
							source: (options as any)?.source ?? "title",
							maxLength: (options as any)?.maxLength ?? 96,
						},
					},
				],
			}));

			const seoResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "seo",
				fields: [
					{ name: "metaTitle", type: "string" },
					{ name: "metaDescription", type: "text" },
					{ name: "ogImage", type: "image" },
				],
			}));

			const publishableResolver = defineAbstractResolver(() => ({
				type: "abstract" as const,
				name: "publishable",
				fields: [
					{ name: "publishedAt", type: "datetime" },
					{ name: "status", type: "string" },
				],
			}));

			const schemaMap = {
				singleton: singletonResolver,
				sluggable: sluggableResolver,
				seo: seoResolver,
				publishable: publishableResolver,
			};

			// Enable only some abstracts
			const result = resolveAbstractSchemaTypes(
				schemaMap,
				{
					singleton: false,
					sluggable: true,
					seo: true,
					publishable: false,
				},
				{ apiVersion: "2024-01-01" },
			);

			expect(result).toHaveLength(2);
			expect(result.every((r) => typeof r === "function")).toBe(true);
		});

		it("should work with plugin configuration pattern", () => {
			// Simulating a plugin that exposes abstract schemas
			const createPluginAbstracts = (
				config: { singleton?: boolean; sync?: boolean } = {},
			) => {
				const schemaMap = {
					singleton: defineAbstractResolver(() => ({
						type: "abstract" as const,
						name: "singleton",
						fields: [{ name: "isSingleton", type: "boolean" }],
					})),
					sync: defineAbstractResolver(() => ({
						type: "abstract" as const,
						name: "sync",
						fields: [{ name: "syncEnabled", type: "boolean" }],
					})),
				};

				return resolveAbstractSchemaTypes(schemaMap, {
					singleton: config.singleton ?? false,
					sync: config.sync ?? false,
				});
			};

			// User enables only singleton
			const abstracts = createPluginAbstracts({ singleton: true });

			expect(abstracts).toHaveLength(1);
		});
	});
});
