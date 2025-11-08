import {DocumentActionComponent, DocumentActionsContext} from "sanity";

/**
 * Action preset that removes all document actions, making the document read-only.
 * Useful for documents that should not be modified through the Studio UI.
 *
 * @example
 * ```ts
 * defineDocument({
 *   name: "settings",
 *   title: "Settings",
 *   fields: [...],
 *   options: {
 *     actions: readOnlyActionsPreset,
 *   },
 * });
 * ```
 */
export function readOnlyActionsPreset(): DocumentActionComponent[] {
  return [];
}

/**
 * Action preset for singleton documents that removes actions that don't make
 * sense for single-instance documents (delete, duplicate, unpublish).
 * Keeps publish, discardChanges, and restore actions.
 *
 * @example
 * ```ts
 * defineDocument({
 *   name: "homePage",
 *   title: "Home Page",
 *   fields: [...],
 *   options: {
 *     actions: singletonActionsPreset,
 *   },
 * });
 * ```
 */
export function singletonActionsPreset(
  prev: DocumentActionComponent[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: DocumentActionsContext,
): DocumentActionComponent[] {
  return prev.filter(
    (action) =>
      !["delete", "duplicate", "unpublish"].includes(action.action || ""),
  );
}

/**
 * Action preset that removes only the delete action while preserving all others.
 * Useful for protecting important documents from accidental deletion.
 *
 * @example
 * ```ts
 * defineDocument({
 *   name: "article",
 *   title: "Article",
 *   fields: [...],
 *   options: {
 *     actions: noDeleteActionsPreset,
 *   },
 * });
 * ```
 */
export function noDeleteActionsPreset(
  prev: DocumentActionComponent[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: DocumentActionsContext,
): DocumentActionComponent[] {
  return prev.filter((action) => action.action !== "delete");
}

/**
 * Action preset that only allows publish-related actions (publish, unpublish, discardChanges).
 * Removes delete, duplicate, and other management actions.
 *
 * @example
 * ```ts
 * defineDocument({
 *   name: "blogPost",
 *   title: "Blog Post",
 *   fields: [...],
 *   options: {
 *     actions: publishOnlyActionsPreset,
 *   },
 * });
 * ```
 */
export function publishOnlyActionsPreset(
  prev: DocumentActionComponent[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: DocumentActionsContext,
): DocumentActionComponent[] {
  return prev.filter((action) =>
    ["publish", "unpublish", "discardChanges", "restore"].includes(
      action.action || "",
    ),
  );
}

/**
 * Action preset factory that applies different action presets based on user roles.
 * Returns a function that can be used as an action preset.
 *
 * @param roleConfig - Configuration object mapping roles to action preset functions
 *
 * @example
 * ```ts
 * const roleBasedActions = byRoleActions({
 *   editor: (prev) => prev, // All actions
 *   contributor: publishOnlyActionsPreset,
 *   viewer: singletonActionsPreset,
 *   admin: (prev, context) => {
 *     // Custom logic
 *     return prev.filter(action => action.action !== 'delete');
 *   }
 * });
 *
 * defineDocument({
 *   name: "article",
 *   title: "Article",
 *   fields: [...],
 *   options: {
 *     actions: roleBasedActions,
 *   },
 * });
 * ```
 */
export function byRoleActions(
  roleConfig: Record<
    string,
    (
      prev: DocumentActionComponent[],
      context: DocumentActionsContext,
    ) => DocumentActionComponent[]
  >,
) {
  return function roleBasedActions(
    prev: DocumentActionComponent[],
    context: DocumentActionsContext,
  ): DocumentActionComponent[] {
    // Get user roles from context
    const userRoles =
      context.currentUser && "roles" in context.currentUser
        ? (context.currentUser as {roles: Array<{name: string}>}).roles
        : [];

    if (!userRoles || userRoles.length === 0) {
      // If no roles found, use default actions or return all
      return prev;
    }

    // Apply the first matching role's action preset
    for (const role of userRoles) {
      const actionPreset = roleConfig[role.name];
      if (actionPreset) {
        return actionPreset(prev, context);
      }
    }

    // No roles matched config, use default actions
    return prev;
  };
}
