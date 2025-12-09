import type {SchemaTypeDefinition} from "sanity";
import documents from "./documents";
import objects from "./objects";

const schemas = [...documents, ...objects] as SchemaTypeDefinition[];

export default schemas;
