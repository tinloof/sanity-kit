import type {NewDocumentOptionsContext, TemplateItem} from "sanity";

import type {NewDocumentCreationContextType} from "../types";

/**
 * Remove a document template from specific creation contexts
 *
 * Use this utility within a document schema to prevent it from being created
 * in certain contexts. For example, remove singleton documents like "home" or
 * "settings" from the global creation menu.
 *
 * @param contexts - Array of creation context types where the template should be removed.
 *   - "global": Global "+ Create" button
 *   - "structure": Structure tool
 *   - "document": Creating from within a document (references, etc.)
 * @param schemaName - The schema name of the document to remove
 *
 * @returns A function that can be used as newDocumentOptions in a document schema
 *
 * @example
 * ```ts
 * export default defineDocument({
 *   name: "home",
 *   title: "Home",
 *   options: {
 *     newDocumentOptions: newDocumentOptionsRemove(["global"], "home"),
 *   },
 *   fields: [...],
 * });
 * ```
 */
export function newDocumentOptionsRemove(
  contexts: NewDocumentCreationContextType[],
  schemaName: string,
) {
  return (
    prev: TemplateItem[],
    context: NewDocumentOptionsContext,
  ): TemplateItem[] => {
    const {creationContext} = context;

    if (contexts.includes(creationContext.type)) {
      return prev.filter(
        (templateItem) => templateItem.templateId !== schemaName,
      );
    }

    return prev;
  };
}

/**
 * Remove document template based on user role and creation context
 *
 * Removes the document template when users with specified roles try to create
 * in the specified contexts. This allows you to restrict where certain roles
 * can create this document type.
 *
 * @param schemaName - The schema name of the document
 * @param roleContextMap - Record mapping role names to contexts where the template should be removed.
 *   Each key should be a role name, and each value should be an array of contexts
 *   where users with that role cannot create this document.
 *   - "global": Global "+ Create" button
 *   - "structure": Structure tool
 *   - "document": Creating from within a document (references, etc.)
 *
 * @returns A function that can be used as newDocumentOptions in a document schema
 *
 * @example
 * ```ts
 * export default defineDocument({
 *   name: "blogPost",
 *   title: "Blog Post",
 *   options: {
 *     newDocumentOptions: newDocumentOptionsRemoveByRole("blogPost", {
 *       contributor: ["global"], // Contributors cannot create from global menu
 *       editor: ["document"], // Editors cannot create from within documents
 *     }),
 *   },
 *   fields: [...],
 * });
 * ```
 */
export function newDocumentOptionsRemoveByRole(
  schemaName: string,
  roleContextMap: Record<string, NewDocumentCreationContextType[]>,
) {
  return (
    prev: TemplateItem[],
    context: NewDocumentOptionsContext,
  ): TemplateItem[] => {
    const {currentUser, creationContext} = context;

    // Check if any of the user's roles should remove the template in this context
    const shouldRemove = currentUser?.roles.some((role) => {
      const restrictedContexts = roleContextMap[role.name];
      return restrictedContexts?.includes(creationContext.type);
    });

    if (shouldRemove) {
      return prev.filter(
        (templateItem) => templateItem.templateId !== schemaName,
      );
    }

    return prev;
  };
}
