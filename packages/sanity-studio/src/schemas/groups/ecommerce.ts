import {TagIcon} from "@sanity/icons";
import type {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured e-commerce field group with tag icon.
 *
 * This field group is designed for organizing e-commerce and product-related fields in document schemas.
 * It provides a consistent grouping structure for products, pricing, inventory, categories, and shopping features.
 *
 * @returns A Sanity field group definition for e-commerce fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * ecommerceSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "product",
 *   type: "document",
 *   groups: [ecommerceSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "price",
 *       type: "number",
 *       group: "ecommerce", // Fields will be grouped under "ecommerce"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: TagIcon,
	name: "ecommerce",
	title: "E-commerce",
} as FieldGroupDefinition;
