import {orderableAbstract, singletonAbstract, syncAbstract} from "./abstracts";

/** Default title for the structure tool */
export const TOOL_TITLE = "General";

/** Default field name for locale in localized documents */
export const LOCALE_FIELD_NAME = "locale";

export const ABSTRACT_SCHEMA_MAP = {
  singleton: singletonAbstract,
  sync: syncAbstract,
  orderable: orderableAbstract,
} as const;
