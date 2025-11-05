import {
  DocumentActionComponent,
  DocumentActionsContext,
  type SchemaTypeDefinition,
} from "sanity";

import {type SanityActions, type SanityDocumentActions} from "../types";

/**
 * Extract action names from document action components
 */
function extractActionNames(
  components: DocumentActionComponent[],
): SanityDocumentActions[] {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (components as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((component: any) => component?.action)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((action: any): action is string => typeof action === "string")
      .filter(
        (action) => action !== "TaskCreateAction",
      ) as SanityDocumentActions[]
  );
}

/**
 * Get the documentActions configuration for a schema type
 */
function getDocumentActionsConfig(
  schemas: SchemaTypeDefinition[],
  schemaType: string,
): SanityActions | undefined {
  const schema = schemas.find((s) => s.name === schemaType);
  if (!schema || schema.type !== "document") return undefined;

  return (schema.options as {documentActions?: SanityActions} | undefined)
    ?.documentActions;
}

/**
 * Create a placeholder action component that does nothing
 */
function createPlaceholderAction(label: string): DocumentActionComponent {
  function PlaceholderAction() {
    return {
      label,
      onHandle: () => {
        // Placeholder action does nothing
      },
      disabled: true,
    };
  }
  PlaceholderAction.displayName = `PlaceholderAction(${label})`;
  return PlaceholderAction as unknown as DocumentActionComponent;
}

/**
 * Validate that only one mutually exclusive property is set
 */
function validateMutualExclusivity(
  policy: Record<string, unknown>,
  schemaType?: string,
): void {
  const exclusiveProps = ["allow", "deny", "toggles", "byRole"] as const;
  const setProps = exclusiveProps.filter(
    (prop) => policy[prop] !== undefined && policy[prop] !== null,
  );

  if (setProps.length > 1) {
    const schemaInfo = schemaType ? ` for schema "${schemaType}"` : "";
    throw new Error(
      `[defineActions] Only one of the mutually exclusive properties (allow, deny, toggles, byRole) can be specified in documentActions${schemaInfo}. Found: ${setProps.join(", ")}.`,
    );
  }
}

/**
 * Apply action policy to filter actions
 */
function applyPolicy(
  actions: SanityDocumentActions[],
  policy: SanityActions,
  userRoles?: string[],
  schemaType?: string,
): SanityDocumentActions[] {
  // Validate mutual exclusivity at runtime
  validateMutualExclusivity(policy, schemaType);

  // Handle policy object
  const {allow, deny, toggles, byRole} = policy;

  // Start with all actions
  let filtered = actions;

  // Apply role-based policy if available
  if (byRole && userRoles && userRoles.length > 0) {
    userRoles.forEach((userRole) => {
      const rolePolicy = byRole[userRole];
      if (rolePolicy) {
        // Recursively validate nested role policies
        if (typeof rolePolicy === "object") {
          validateMutualExclusivity(rolePolicy, schemaType);
        }
        filtered = applyPolicy(
          filtered,
          rolePolicy as SanityActions,
          [userRole],
          schemaType,
        );
      }
    });
  }

  // Apply allow list (whitelist) - only these actions are allowed
  if (allow) {
    filtered = filtered.filter((action) => allow.includes(action));
    // Also include explicitly allowed actions even if not in current filtered list
    const allowedSet = new Set(allow);
    actions.forEach((action) => {
      if (allowedSet.has(action) && !filtered.includes(action)) {
        filtered.push(action);
      }
    });
  }

  // Apply deny list (blacklist) - remove these actions
  if (deny) {
    filtered = filtered.filter((action) => !deny.includes(action));
  }

  // Apply toggles (fine-grained control)
  if (toggles) {
    filtered = filtered.filter((action) => {
      const toggle = toggles[action];
      // If toggle is explicitly set, use it; otherwise keep the action
      return toggle !== false;
    });
    // Add actions that are explicitly enabled
    Object.entries(toggles).forEach(([action, enabled]) => {
      if (
        enabled === true &&
        !filtered.includes(action as SanityDocumentActions)
      ) {
        filtered.push(action as SanityDocumentActions);
      }
    });
  }

  return filtered;
}

/**
 * Creates a document actions resolver that applies SanityActions configuration
 * from document schemas to filter available actions.
 *
 * Can be used directly as a resolver: `document: { actions: defineActions }`
 *
 * @param prev - Previous document action components
 * @param context - Document actions context from Sanity
 * @returns Filtered document actions based on the schema's documentActions configuration
 */
function defineActions(
  prev: DocumentActionComponent[],
  context: DocumentActionsContext,
): DocumentActionComponent[] {
  const {
    currentUser,
    schema: {_original},
    schemaType,
  } = context;
  const {types: schemas = []} = (_original as {
    types: SchemaTypeDefinition[];
  }) || {
    types: [],
  };

  // Get the documentActions configuration for this schema type
  const actionsConfig = getDocumentActionsConfig(schemas, schemaType);

  if (!actionsConfig) {
    return prev;
  }

  // Extract action names from components
  const actionNames = extractActionNames(prev);

  const userRoles = currentUser?.roles?.map((role) => role.name);

  const filteredActionNames = applyPolicy(
    actionNames,
    actionsConfig,
    userRoles,
    schemaType,
  );

  // Filter components to only include allowed actions (not just separators)
  const filtered = prev.filter((component) => {
    if (!component?.action) return true; // Keep components without action (e.g., separators)
    return filteredActionNames.includes(component.action);
  });

  // Check if there are any action components left
  const hasActionComponents = filtered.some(
    (component) => component?.action !== undefined,
  );

  // If no actions remain, return a placeholder action
  // This prevents Sanity from showing an empty actions menu and erroring
  if (!hasActionComponents || filteredActionNames.length === 0) {
    return [createPlaceholderAction("No actions available")];
  }

  return filtered;
}

// Type assertion to make it compatible with both sanity v3 and v4
// This handles version mismatch between the package's v3 types and consumer's v4 types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineActions as (prev: any[], context: any) => any[];
