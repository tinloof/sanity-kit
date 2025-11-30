export type {
  AbstractDefinition,
  AbstractDefinitionResolver,
  ExtendedType,
  ExtendsRegistry,
  CreateAbstractsConfig,
} from "./types";

import "./types";

export {resolveAbstractSchemaTypes} from "./resolve-abstract-schema-types";

export {defineAbstractResolver} from "./define-abstract-resolver";

export {withExtends} from "./with-extends";
