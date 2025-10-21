import {SchemaTypeDefinition} from "sanity";

import documents from "./documents";

export const schemaTypes = [...documents] as SchemaTypeDefinition[];
