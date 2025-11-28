import {SchemaTypeDefinition} from "sanity";
import documents from "./documents";
import objects from "./objects";
import sections from "./sections";

const schemas = [
  ...documents,
  ...objects,
  ...sections,
] as SchemaTypeDefinition[];

export default schemas;
