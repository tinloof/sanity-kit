import objects from "./objects";
import sections from "./sections";
import documents from "./documents";
import {SchemaTypeDefinition} from "sanity";

const schemas = [...documents, ...objects, ...sections];

export default schemas as SchemaTypeDefinition[];
