import {SchemaTypeDefinition} from "sanity";

import documents from "./documents";
import objects from "./objects";

export const schemaTypes = [...documents, ...objects] as SchemaTypeDefinition[];
